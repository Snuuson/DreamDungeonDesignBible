$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$csvPath = Join-Path $root 'Spell_Ideas_Latest - Spells.csv'
$pagePath = Join-Path $root 'spells.html'
$page = Get-Content -Raw -LiteralPath $pagePath

function Html([string]$value) { [System.Net.WebUtility]::HtmlEncode($value) }
function Display([string]$value) { if ([string]::IsNullOrWhiteSpace($value)) { '—' } else { Html $value } }
function LinkTerms([string]$value) {
  $text = Html $value
  return [regex]::Replace($text, '(?i)\b(momentum|mana|health|threat|weakened|weakend|conditions?|stun(?:ned)?|immobiliz(?:e|ed)|poison(?:ed)?)\b', {
    param($match)
    $target = switch -regex ($match.Value) {
      '^(weakened|weakend)$' { 'weakened'; break }
      '^conditions?$' { 'conditions'; break }
      '^(stun|stunned|immobilize|immobilized)$' { 'crowd-control'; break }
      '^(poison|poisoned)$' { 'conditions'; break }
      default { $match.Value.ToLowerInvariant() }
    }
    '<a href="glossary.html#' + $target + '">' + $match.Value + '</a>'
  })
}

$rows = foreach ($spell in Import-Csv -LiteralPath $csvPath) {
  '<tr><td class="spell-name">{0}</td><td>{1}</td><td>{2}</td><td>{3}</td><td>{4}</td><td>{5}</td><td>{6}</td><td>{7}</td></tr>' -f (Html $spell.Name), (Display $spell.Color), (LinkTerms $spell.Effect), (Display $spell.Cost), (Display $spell.Cooldown), (Display $spell.Range), (Display $spell.Requirements), (Display $spell.Cast)
}

$replacement = "<!-- SPELL_ROWS_START -->`r`n$($rows -join "`r`n")`r`n<!-- SPELL_ROWS_END -->"
$updated = [regex]::Replace($page, '(?s)<!-- SPELL_ROWS_START -->.*?<!-- SPELL_ROWS_END -->', [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $replacement })
[System.IO.File]::WriteAllText($pagePath, $updated, (New-Object System.Text.UTF8Encoding($false)))
