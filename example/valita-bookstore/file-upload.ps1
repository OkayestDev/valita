# Requires the bookstore example: npm run example-server
param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$BookId = "1",
    [string]$UserId = "123",
    [string]$Caption = "Front cover",
    [string]$FilePath
)

$ErrorActionPreference = "Stop"

if (-not $FilePath) {
    $FilePath = Join-Path $PSScriptRoot "cover.png"
}

function Get-MediaType([string]$Path) {
    switch ([System.IO.Path]::GetExtension($Path).ToLower()) {
        ".png" { return "image/png" }
        ".jpg" { return "image/jpeg" }
        ".jpeg" { return "image/jpeg" }
        ".gif" { return "image/gif" }
        ".txt" { return "text/plain" }
        default { return "application/octet-stream" }
    }
}

$file = Get-Item -LiteralPath $FilePath
$mediaType = Get-MediaType $file.FullName
$uri = "$BaseUrl/books/$BookId/cover?userId=$([uri]::EscapeDataString($UserId))"
$fileArg = "cover=@`"$($file.FullName)`";type=$mediaType;filename=$($file.Name)"

$raw = & curl.exe -sS -w "`n%{http_code}" -X POST $uri -F "caption=$Caption" -F $fileArg
if ($LASTEXITCODE -ne 0) {
    throw "Upload request failed (curl exit $LASTEXITCODE)"
}

$text = if ($raw -is [array]) { $raw -join "`n" } else { [string]$raw }
$newline = $text.LastIndexOf("`n")
if ($newline -lt 0) {
    throw "Upload response did not include a status code: $text"
}

$status = [int]$text.Substring($newline + 1).Trim()
$body = $text.Substring(0, $newline) | ConvertFrom-Json

Write-Host "HTTP $status"
$body | ConvertTo-Json -Depth 5 | Write-Host

if ($status -ne 201) {
    throw "Expected status 201, got $status"
}
if ($body.message -ne "Cover uploaded") {
    throw "Expected message 'Cover uploaded'"
}
if ([string]$body.bookId -ne $BookId) {
    throw "Expected bookId $BookId, got $($body.bookId)"
}
if ($body.caption -ne $Caption) {
    throw "Expected caption '$Caption', got '$($body.caption)'"
}
if ($body.cover.filename -ne $file.Name) {
    throw "Expected filename $($file.Name), got $($body.cover.filename)"
}
if ($body.cover.mediaType -ne $mediaType) {
    throw "Expected media type $mediaType, got $($body.cover.mediaType)"
}
if ([int]$body.cover.size -ne $file.Length) {
    throw "Expected size $($file.Length), got $($body.cover.size)"
}

Write-Host "Cover upload succeeded."
