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
  $moonPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $moonPath.StartFigure()
  $moonPath.AddBezier(($Size * .70), ($Size * .17), ($Size * .44), ($Size * .15), ($Size * .29), ($Size * .34), ($Size * .30), ($Size * .53))
  $moonPath.AddBezier(($Size * .30), ($Size * .53), ($Size * .31), ($Size * .74), ($Size * .49), ($Size * .86), ($Size * .74), ($Size * .79))
  $moonPath.AddBezier(($Size * .74), ($Size * .79), ($Size * .55), ($Size * .73), ($Size * .49), ($Size * .61), ($Size * .50), ($Size * .49))
  $moonPath.AddBezier(($Size * .50), ($Size * .49), ($Size * .51), ($Size * .35), ($Size * .58), ($Size * .24), ($Size * .70), ($Size * .17))
  $moonPath.CloseFigure()
  $graphics.FillPath($moonBrush, $moonPath)

  $graphics.SetClip($moonPath)
  $strokeColor = [System.Drawing.Color]::FromArgb(58, 116, 78, 43)
  $strokePen = New-Object System.Drawing.Pen($strokeColor, [Math]::Max(1, ($Size * .009)))
  $graphics.DrawBezier($strokePen, ($Size * .35), ($Size * .35), ($Size * .31), ($Size * .47), ($Size * .38), ($Size * .64), ($Size * .52), ($Size * .73))
  $graphics.DrawBezier($strokePen, ($Size * .39), ($Size * .27), ($Size * .34), ($Size * .43), ($Size * .42), ($Size * .57), ($Size * .55), ($Size * .67))
  $graphics.ResetClip()

  $target = Join-Path $publicDir $FileName
  $bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)

  $strokePen.Dispose()
  $moonPath.Dispose()
  $moonBrush.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

New-NightNotesIcon -Size 48 -FileName "favicon-48x48.png"
New-NightNotesIcon -Size 180 -FileName "apple-touch-icon.png"
New-NightNotesIcon -Size 192 -FileName "icon-192x192.png"
New-NightNotesIcon -Size 512 -FileName "icon-512x512.png"
