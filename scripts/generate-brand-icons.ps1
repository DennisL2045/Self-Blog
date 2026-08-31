Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

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
  $night = [System.Drawing.ColorTranslator]::FromHtml("#101525")
  $moon = [System.Drawing.ColorTranslator]::FromHtml("#E4BD70")
  $graphics.Clear($night)

  $moonBrush = New-Object System.Drawing.SolidBrush($moon)
  $nightBrush = New-Object System.Drawing.SolidBrush($night)
  $outerPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $innerPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $outerPath.AddEllipse(($Size * .17), ($Size * .16), ($Size * .66), ($Size * .68))
  $innerPath.AddEllipse(($Size * .36), ($Size * .10), ($Size * .65), ($Size * .67))
  $graphics.FillPath($moonBrush, $outerPath)

  $graphics.SetClip($outerPath)
  $strokeColor = [System.Drawing.Color]::FromArgb(58, 116, 78, 43)
  $strokePen = New-Object System.Drawing.Pen($strokeColor, [Math]::Max(1, ($Size * .009)))
  $graphics.DrawArc($strokePen, ($Size * .20), ($Size * .19), ($Size * .60), ($Size * .62), 105, 150)
  $graphics.DrawArc($strokePen, ($Size * .24), ($Size * .23), ($Size * .54), ($Size * .55), 108, 145)
  $graphics.ResetClip()
  $graphics.FillPath($nightBrush, $innerPath)

  $target = Join-Path $publicDir $FileName
  $bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)

  $strokePen.Dispose()
  $innerPath.Dispose()
  $outerPath.Dispose()
  $nightBrush.Dispose()
  $moonBrush.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

New-NightNotesIcon -Size 48 -FileName "favicon-48x48.png"
New-NightNotesIcon -Size 180 -FileName "apple-touch-icon.png"
New-NightNotesIcon -Size 192 -FileName "icon-192x192.png"
New-NightNotesIcon -Size 512 -FileName "icon-512x512.png"
