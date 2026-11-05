Add-Type -AssemblyName System.Drawing

function Draw-RotaenoIcon([int]$targetSize, [bool]$isAppleTouch, [string]$outputPath) {
    $bmp = [System.Drawing.Bitmap]::new(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Background Path
    $bgRect = [System.Drawing.Rectangle]::new(0, 0, 512, 512)
    $bgBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
        [System.Drawing.Point]::new(0, 0),
        [System.Drawing.Point]::new(0, 512),
        [System.Drawing.Color]::FromArgb(20, 73, 115),
        [System.Drawing.Color]::FromArgb(6, 21, 36)
    )
    $blend = [System.Drawing.Drawing2D.ColorBlend]::new(3)
    $blend.Colors = @(
        [System.Drawing.Color]::FromArgb(20, 73, 115),
        [System.Drawing.Color]::FromArgb(13, 43, 69),
        [System.Drawing.Color]::FromArgb(6, 21, 36)
    )
    $blend.Positions = @(0.0, 0.55, 1.0)
    $bgBrush.InterpolationColors = $blend

    if ($isAppleTouch) {
        # Apple touch icon should fill the whole square; iOS will clip with its squircle
        $g.FillRectangle($bgBrush, $bgRect)
    } else {
        $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
        $r = 115
        $d = $r * 2
        $path.AddArc(0, 0, $d, $d, 180, 90)
        $path.AddArc(512 - $d, 0, $d, $d, 270, 90)
        $path.AddArc(512 - $d, 512 - $d, $d, $d, 0, 90)
        $path.AddArc(0, 512 - $d, $d, $d, 90, 90)
        $path.CloseFigure()
        $g.FillPath($bgBrush, $path)

        # Border stroke
        $borderPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(35, 255, 255, 255), 2.5)
        $g.DrawPath($borderPen, $path)
        $borderPen.Dispose()
        $path.Dispose()
    }

    # Central Radial Glow
    $glowPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $glowPath.AddEllipse(30, 30, 452, 452)
    $pgh = [System.Drawing.Drawing2D.PathGradientBrush]::new($glowPath)
    $pgh.CenterColor = [System.Drawing.Color]::FromArgb(60, 0, 210, 255)
    $pgh.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    $g.FillEllipse($pgh, 30, 30, 452, 452)
    $pgh.Dispose()
    $glowPath.Dispose()

    # Outer Steering Dashed Circle (r=195, cx=256, cy=256)
    $dashPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(65, 0, 210, 255), 2.2)
    $dashPen.DashPattern = @(3.0, 6.0)
    $g.DrawEllipse($dashPen, 256 - 195, 256 - 195, 390, 390)
    $dashPen.Dispose()

    # Crosshair notches
    $notchPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 0, 242, 254), 3.2)
    $notchPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $notchPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine($notchPen, 256, 46, 256, 64)
    $g.DrawLine($notchPen, 256, 448, 256, 466)
    $g.DrawLine($notchPen, 46, 256, 64, 256)
    $g.DrawLine($notchPen, 448, 256, 466, 256)
    $notchPen.Dispose()

    # Main Judgment Ring (r=148)
    $ringPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(38, 255, 255, 255), 4.0)
    $g.DrawEllipse($ringPen, 256 - 148, 256 - 148, 296, 296)
    $ringPen.Dispose()

    # Cyan Arc (-80 deg to 0 deg, sweep 80 deg)
    # Glow underneath
    $cyanGlowPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(60, 0, 242, 254), 26.0)
    $cyanGlowPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $cyanGlowPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawArc($cyanGlowPen, 256 - 148, 256 - 148, 296, 296, -80, 80)
    $cyanGlowPen.Dispose()

    # Main Cyan Arc
    $cyanBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
        [System.Drawing.Point]::new(200, 108),
        [System.Drawing.Point]::new(404, 256),
        [System.Drawing.Color]::FromArgb(0, 242, 254),
        [System.Drawing.Color]::FromArgb(0, 119, 204)
    )
    $cyanPen = [System.Drawing.Pen]::new($cyanBrush, 14.0)
    $cyanPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $cyanPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawArc($cyanPen, 256 - 148, 256 - 148, 296, 296, -80, 80)
    $cyanPen.Dispose()
    $cyanBrush.Dispose()

    # Dot at (404, 256)
    $whiteBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
    $g.FillEllipse($whiteBrush, 404 - 7, 256 - 7, 14, 14)

    # Gold Arc (100 deg to 180 deg, sweep 80 deg)
    # Glow underneath
    $goldGlowPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(60, 255, 200, 80), 26.0)
    $goldGlowPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $goldGlowPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawArc($goldGlowPen, 256 - 148, 256 - 148, 296, 296, 100, 80)
    $goldGlowPen.Dispose()

    # Main Gold Arc
    $goldBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
        [System.Drawing.Point]::new(282, 404),
        [System.Drawing.Point]::new(108, 256),
        [System.Drawing.Color]::FromArgb(255, 226, 89),
        [System.Drawing.Color]::FromArgb(217, 119, 6)
    )
    $goldPen = [System.Drawing.Pen]::new($goldBrush, 14.0)
    $goldPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $goldPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawArc($goldPen, 256 - 148, 256 - 148, 296, 296, 100, 80)
    $goldPen.Dispose()
    $goldBrush.Dispose()

    # Dot at (108, 256)
    $g.FillEllipse($whiteBrush, 108 - 7, 256 - 7, 14, 14)
    $whiteBrush.Dispose()

    # Gyroscope center
    $gyroRingPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(55, 255, 255, 255), 2.0)
    $g.DrawEllipse($gyroRingPen, 256 - 46, 256 - 46, 92, 92)
    $gyroRingPen.Dispose()

    $coreBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(13, 43, 69))
    $corePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(0, 242, 254), 2.5)
    $g.FillEllipse($coreBrush, 256 - 24, 256 - 24, 48, 48)
    $g.DrawEllipse($corePen, 256 - 24, 256 - 24, 48, 48)
    $coreBrush.Dispose()
    $corePen.Dispose()

    # Diamond center
    $diamondPoints = @(
        [System.Drawing.Point]::new(256, 242),
        [System.Drawing.Point]::new(270, 256),
        [System.Drawing.Point]::new(256, 270),
        [System.Drawing.Point]::new(242, 256)
    )
    $diamondBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 180, 60))
    $g.FillPolygon($diamondBrush, $diamondPoints)
    $diamondBrush.Dispose()

    $bgBrush.Dispose()
    $g.Dispose()

    # Resize if needed
    if ($targetSize -eq 512) {
        $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } else {
        $resized = [System.Drawing.Bitmap]::new($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $rg = [System.Drawing.Graphics]::FromImage($resized)
        $rg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $rg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $rg.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $rg.DrawImage($bmp, 0, 0, $targetSize, $targetSize)
        $resized.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $rg.Dispose()
        $resized.Dispose()
    }
    $bmp.Dispose()
}

$dir = "d:\antigravity\rotaeno\rotaeno-rating-project"
Draw-RotaenoIcon 180 $true "$dir\apple-touch-icon.png"
Draw-RotaenoIcon 192 $false "$dir\icon-192.png"
Draw-RotaenoIcon 512 $false "$dir\icon-512.png"
Draw-RotaenoIcon 64 $false "$dir\favicon.png"
Draw-RotaenoIcon 32 $false "$dir\favicon-32x32.png"
Write-Output "Done generating PNG icons"
