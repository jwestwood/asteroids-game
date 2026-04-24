export function renderHUD(ctx, W, H, gameStarted, gameOver, score, level, lives, activePowerups) {
    ctx.clearRect(0, 0, W(), H());

    if (!gameStarted) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 52px monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText('ASTEROIDS', W() / 2, H() / 2 - 50);
        ctx.font = '20px monospace';
        ctx.fillStyle = '#aaa';
        ctx.fillText('Press SPACE to start', W() / 2, H() / 2 + 10);
        ctx.font = '16px monospace';
        ctx.fillStyle = '#666';
        ctx.fillText('Arrow keys / WASD to move', W() / 2, H() / 2 + 50);
        ctx.fillText('SPACE to shoot', W() / 2, H() / 2 + 75);
        return;
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText('Score: ' + score, 20, 16);
    ctx.fillText('Level: ' + level, 20, 44);

    ctx.save();
    for (let i = 0; i < lives; i++) {
        const lx = W() - 40 - i * 30;
        ctx.translate(lx, 30);
        ctx.scale(0.6, 0.6);
        ctx.rotate(-Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(12, 10);
        ctx.lineTo(-12, 10);
        ctx.closePath();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    ctx.restore();

    // Active powerup indicators
    const pwInfo = [
        { key: 'invincible', label: 'INVINCIBLE', color: '#ffdb33' },
        { key: 'rapidFire', label: 'RAPID FIRE', color: '#ff4033' },
        { key: 'splitShot', label: 'SPLIT SHOT', color: '#4ddfff' },
        { key: 'longRange', label: 'LONG RANGE', color: '#80b3ff' },
    ];
    let py = 80;
    for (const pw of pwInfo) {
        if (activePowerups[pw.key] > 0) {
            const secs = Math.ceil(activePowerups[pw.key] / 60);
            ctx.font = '13px monospace';
            ctx.fillStyle = pw.color;
            ctx.textAlign = 'left';
            ctx.fillText(`${pw.label} (${secs}s)`, 20, py);
            py += 20;
        }
    }

    if (gameOver) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 48px monospace';
        ctx.fillStyle = '#f44';
        ctx.fillText('GAME OVER', W() / 2, H() / 2 - 40);
        ctx.font = '24px monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText('Final Score: ' + score, W() / 2, H() / 2 + 10);
        ctx.font = '20px monospace';
        ctx.fillStyle = '#aaa';
        ctx.fillText('Press SPACE to restart', W() / 2, H() / 2 + 50);
    }
}
