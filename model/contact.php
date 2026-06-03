<?php
declare(strict_types=1);
session_start();

header('Content-Type: application/json; charset=utf-8');

// Only allow GET (CSRF token) and POST (submit)
$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'GET' && ($_GET['action'] ?? '') === 'csrf') {
    echo json_encode(['token' => getCsrfToken()]);
    exit;
}

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

/* ── 1. LOAD CONFIG ──────────────────────────────────────── */

require_once __DIR__ . '/db-config.php';   // defines DB_* constants
const RATE_LIMIT_SECONDS = 60;

$ipKey = 'cf_last_' . md5($_SERVER['REMOTE_ADDR'] ?? 'unknown');

if (isset($_SESSION[$ipKey])) {
    $elapsed = time() - (int)$_SESSION[$ipKey];
    if ($elapsed < RATE_LIMIT_SECONDS) {
        $wait = RATE_LIMIT_SECONDS - $elapsed;
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'message' => "Please wait {$wait} second(s) before submitting again."
        ]);
        exit;
    }
}

/* ── 3. CSRF CHECK ───────────────────────────────────────── */

$submittedToken = $_POST['csrf_token'] ?? '';
$sessionToken   = $_SESSION['csrf_token'] ?? '';

// Only enforce CSRF when a session token exists
// (won't block if site is static-hosted without PHP sessions)
if ($sessionToken && !hash_equals($sessionToken, $submittedToken)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Invalid security token. Please refresh and try again.']);
    exit;
}

/* ── 4. INPUT VALIDATION ─────────────────────────────────── */

const MAX_NAME    = 100;
const MAX_EMAIL   = 150;
const MAX_MESSAGE = 2000;

$rawName    = $_POST['name']    ?? '';
$rawEmail   = $_POST['email']   ?? '';
$rawMessage = $_POST['message'] ?? '';

// Trim
$name    = trim($rawName);
$email   = trim($rawEmail);
$message = trim($rawMessage);

$errors = [];

// Name
if ($name === '' || mb_strlen($name) < 2) {
    $errors[] = 'Name must be at least 2 characters.';
} elseif (mb_strlen($name) > MAX_NAME) {
    $errors[] = 'Name is too long (max ' . MAX_NAME . ' characters).';
}

// Email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email address is required.';
} elseif (mb_strlen($email) > MAX_EMAIL) {
    $errors[] = 'Email address is too long.';
}

// Message
if (mb_strlen($message) < 10) {
    $errors[] = 'Message must be at least 10 characters.';
} elseif (mb_strlen($message) > MAX_MESSAGE) {
    $errors[] = 'Message is too long (max ' . MAX_MESSAGE . ' characters).';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// Sanitise for storage (strips HTML tags, encodes special chars)
$safeName    = htmlspecialchars(strip_tags($name),    ENT_QUOTES, 'UTF-8');
$safeEmail   = htmlspecialchars(strip_tags($email),   ENT_QUOTES, 'UTF-8');
$safeMessage = htmlspecialchars(strip_tags($message), ENT_QUOTES, 'UTF-8');


try {
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        DB_HOST, DB_PORT, DB_NAME
    );

    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES   => false,   // real prepared statements
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
    ]);

    /*
     * Prepared statement - user input is NEVER interpolated into SQL.
     * PDO binds values separately from the query, making SQL injection
     * structurally impossible for these fields.
     */
    $stmt = $pdo->prepare(
        "INSERT INTO contact_messages
            (name, email, message, ip_address, submitted_at)
         VALUES
            (:name, :email, :message, :ip, NOW())"
    );

    $stmt->execute([
        ':name'    => $safeName,
        ':email'   => $safeEmail,
        ':message' => $safeMessage,
        ':ip'      => substr($_SERVER['REMOTE_ADDR'] ?? '', 0, 45),
    ]);

    // Record rate-limit timestamp ONLY after a successful insert
    $_SESSION[$ipKey] = time();

    // Rotate CSRF token after successful use
    regenerateCsrfToken();

    echo json_encode(['success' => true, 'message' => 'Message received! I\'ll respond within 24 hours.']);

} catch (PDOException $e) {
    // Log the real error server-side, never send it to the client
    error_log('[contact.php] DB error: ' . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not save your message right now. Please try again later or email directly.'
    ]);
}

/* ── CSRF HELPERS ────────────────────────────────────────── */

function getCsrfToken(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function regenerateCsrfToken(): void
{
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
