Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$publicDir = Join-Path $projectRoot "public"

function New-NightNotesIcon {
  param(
    [Parameter(Mandatory = $true)][int]$Size,
    [Parameter(Mandatory = $true)][string]$FileName
  )

  $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
  $bitmap.SetResolution(96, 96)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $night = [System.Drawing.ColorTranslator]::FromHtml("#101525")
  $moon = [System.Drawing.ColorTranslator]::FromHtml("#E4BD70")
  $paper = [System.Drawing.ColorTranslator]::FromHtml("#F3EAD9")
  $graphics.Clear($night)

  $font = New-Object System.Drawing.Font("Segoe UI", ($Size * 0.56), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $textBrush = New-Object System.Drawing.SolidBrush($paper)
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $textArea = New-Object System.Drawing.RectangleF(($Size * 0.02), ($Size * 0.07), ($Size * 0.88), ($Size * 0.88))
  $graphics.DrawString("N", $font, $textBrush, $textArea, $format)

  $moonBrush = New-Object System.Drawing.SolidBrush($moon)
  $nightBrush = New-Object System.Drawing.SolidBrush($night)
  $moonSize = [float]($Size * 0.17)
  $moonX = [float]($Size * 0.72)
  $moonY = [float]($Size * 0.13)
  $graphics.FillEllipse($moonBrush, $moonX, $moonY, $moonSize, $moonSize)
  $graphics.FillEllipse($nightBrush, ($moonX + $Size * 0.055), ($moonY - $Size * 0.025), $moonSize, $moonSize)

  $target = Join-Path $publicDir $FileName
  $bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)

  $format.Dispose()
  $nightBrush.Dispose()
  $moonBrush.Dispose()
  $textBrush.Dispose()
  $font.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

New-NightNotesIcon -Size 48 -FileName "favicon-48x48.png"
New-NightNotesIcon -Size 180 -FileName "apple-touch-icon.png"
New-NightNotesIcon -Size 192 -FileName "icon-192x192.png"
New-NightNotesIcon -Size 512 -FileName "icon-512x512.png"
