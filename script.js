let points = 1000;
let gameInterval;
let countdownInterval;
let isBettingTimeOver = false;
let userBetTaiXiu = ''; // Biến lưu trữ cược của người chơi cho Tài Xỉu
let userBetChanLe = ''; // Biến lưu trữ cược của người chơi cho Chẵn Lẻ
let betAmountTaiXiu = 0; // Số tiền cược của người chơi cho Tài Xỉu
let betAmountChanLe = 0; // Số tiền cược của người chơi cho Chẵn Lẻ
let bettingStartTime = 0; // Thời gian bắt đầu đặt cược

let resultSequence = []; // Chuỗi kết quả
let currentIndex = 0; // Chỉ số hiện tại trong chuỗi kết quả

let consecutiveWins = 0; // Số lần thắng liên tiếp khi đặt tất tay
let lastBetAllIn = false; // Kiểm tra nếu người chơi đã đặt tất tay ở lượt trước

function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

function updateDiceImages(dice1, dice2, dice3) {
    const dicePaths = [
        '/New folder/dice_black_1-512.webp',
        '/New folder/dice_black_2-512.webp',
        '/New folder/dice_black_3-512.webp',
        '/New folder/dice_black_4-512.webp',
        '/New folder/dice_black_5-512.webp',
        '/New folder/dice_black_6-512.webp'
    ];

    document.getElementById('dice1').src = dicePaths[dice1 - 1];
    document.getElementById('dice2').src = dicePaths[dice2 - 1];
    document.getElementById('dice3').src = dicePaths[dice3 - 1];
    document.getElementById('result').textContent = `Kết quả xúc xắc: ${dice1}, ${dice2}, ${dice3}`;
}

function startGame() {
    let count = 0;
    const totalCount = 10;

    function updateGame() {
        if (count < totalCount) {
            count++;
            document.getElementById('timer').textContent = `Thời gian đếm: ${count} giây`;
        } else {
            clearInterval(gameInterval);
            startBettingPhase();
        }
    }

    gameInterval = setInterval(updateGame, 1000);
}

function startBettingPhase() {
    document.getElementById('timer').textContent = "Bạn có 10 giây để đặt cược!";
    
    let bettingTime = 10;
    bettingStartTime = Date.now();

    function updateBettingTime() {
        const elapsedTime = Math.floor((Date.now() - bettingStartTime) / 1000);
        bettingTime = 10 - elapsedTime;

        if (bettingTime <= 0) {
            clearInterval(countdownInterval);
            isBettingTimeOver = true;
            revealResults();
        }

        document.getElementById('bettingTimer').textContent = `Thời gian đặt cược: ${bettingTime} giây`;
    }

    countdownInterval = setInterval(updateBettingTime, 1000);
}

function revealResults() {
    document.getElementById('bettingTimer').textContent = "Đang mở kết quả trong 3 giây...";
    
    setTimeout(() => {
        if (isBettingTimeOver) {
            check();
        }
        resetButtons();
        startGame();
    }, 3000);
}

function setBetAmount(betType, amount) {
    if (points < 1) {
        alert('Vui lòng nạp thêm tiền để tiếp tục chơi.');
        return;
    }

    if (amount === 'all') {
        amount = points;
    }

    if (betType === 'TaiXiu') {
        document.getElementById('betAmountTaiXiu').value = amount;
    } else if (betType === 'ChanLe') {
        document.getElementById('betAmountChanLe').value = amount;
    }
}

function placeBet(betType) {
    if (points < 1) {
        alert('Vui lòng nạp thêm tiền để tiếp tục chơi.');
        return;
    }

    let betAmountInput;
    let betWarning;

    if (betType === 'tai' || betType === 'xiu') {
        betAmountInput = document.getElementById('betAmountTaiXiu').value;
        betWarning = document.getElementById('betWarningTaiXiu');
    } else {
        betAmountInput = document.getElementById('betAmountChanLe').value;
        betWarning = document.getElementById('betWarningChanLe');
    }

    if (betAmountInput && betAmountInput > 0 && betAmountInput <= points) {
        if (betType === 'tai' || betType === 'xiu') {
            betAmountTaiXiu = parseFloat(betAmountInput);
            userBetTaiXiu = betType;
            points -= betAmountTaiXiu; // Trừ tiền ngay khi đặt cược
        } else {
            betAmountChanLe = parseFloat(betAmountInput);
            userBetChanLe = betType;
            points -= betAmountChanLe; // Trừ tiền ngay khi đặt cược
        }
        points = Math.floor(points); // Làm tròn số tiền còn lại đến 1 đơn vị
        document.getElementById('points').textContent = `Tiền Của Bạn Là: ${points}`;
        betWarning.textContent = '';
        updateButtonStyles(betType);
    } else {
        betWarning.textContent = 'Vui lòng nhập số tiền cược hợp lệ!';
    }
}

function check() {
    const dice1 = rollDice();
    const dice2 = rollDice();
    const dice3 = rollDice();
    const sum = dice1 + dice2 + dice3;
    updateDiceImages(dice1, dice2, dice3);

    let resultText = '';

    const isTai = sum >= 11 && sum <= 18; // Số từ 11 đến 18 là Tài
    const isChan = sum % 2 === 0;

    const isTaiWin = (userBetTaiXiu === 'tai' && isTai) || (userBetTaiXiu === 'xiu' && !isTai);
    const isChanWin = (userBetChanLe === 'chan' && isChan) || (userBetChanLe === 'le' && !isChan);

    if (!userBetTaiXiu && !userBetChanLe) {
        resultText = 'Hãy đặt cược ở vòng tiếp theo';
    } else {
        let taiWin = isTaiWin;
        let chanWin = isChanWin;

        // Kiểm tra số lần thắng liên tiếp khi đặt tất tay
        if (lastBetAllIn && consecutiveWins >= 2) {
            if (userBetTaiXiu === 'tai') taiWin = !isTaiWin;
            if (userBetTaiXiu === 'xiu') taiWin = !isTaiWin;
            if (userBetChanLe === 'chan') chanWin = !isChanWin;
            if (userBetChanLe === 'le') chanWin = !isChanWin;

            consecutiveWins = 0; // Reset chuỗi thắng liên tiếp
        }

        if (taiWin) {
            points += betAmountTaiXiu * 1.97; // Nhân số tiền cược lên 1.97 khi thắng
            resultText += `Bạn chọn ${userBetTaiXiu}. Chúc mừng! Bạn đã thắng cược Tài Xỉu. `;
            if (betAmountTaiXiu === points) {
                consecutiveWins++;
                lastBetAllIn = true;
            }
        } else {
            resultText += `Bạn chọn ${userBetTaiXiu}. Rất tiếc! Bạn đã thua cược Tài Xỉu. `;
            consecutiveWins = 0;
            lastBetAllIn = false;
        }

        if (chanWin) {
            points += betAmountChanLe * 1.97; // Nhân số tiền cược lên 1.97 khi thắng
            resultText += `Bạn chọn ${userBetChanLe}. Chúc mừng! Bạn đã thắng cược Chẵn Lẻ. `;
            if (betAmountChanLe === points) {
                consecutiveWins++;
                lastBetAllIn = true;
            }
        } else {
            resultText += `Bạn chọn ${userBetChanLe}. Rất tiếc! Bạn đã thua cược Chẵn Lẻ. `;
            consecutiveWins = 0;
            lastBetAllIn = false;
        }
    }

    points = Math.floor(points); // Làm tròn số tiền còn lại đến 1 đơn vị
    document.getElementById('points').textContent = `Tiền Của Bạn Là: ${points}`;

    // Reset bet amounts and selections to 0 after each round
    document.getElementById('betAmountTaiXiu').value = 0;
    document.getElementById('betAmountChanLe').value = 0;
    resetButtons();

    if (points < 1) {
        alert('Vui lòng nạp thêm tiền để tiếp tục chơi.');
    }

    document.getElementById('result').textContent = resultText;
}

function updateButtonStyles(selectedBet) {
    if (selectedBet === 'xiu' || selectedBet === 'tai') {
        document.getElementById('xiuButton').classList.toggle('selected', selectedBet === 'xiu');
        document.getElementById('taiButton').classList.toggle('selected', selectedBet === 'tai');
        document.getElementById('xiuButton').classList.add('disabled');
        document.getElementById('taiButton').classList.add('disabled');
    } else {
        document.getElementById('chanButton').classList.toggle('selected', selectedBet === 'chan');
        document.getElementById('leButton').classList.toggle('selected', selectedBet === 'le');
        document.getElementById('chanButton').classList.add('disabled');
        document.getElementById('leButton').classList.add('disabled');
    }
}

function resetButtons() {
    document.getElementById('xiuButton').classList.remove('selected', 'disabled');
    document.getElementById('taiButton').classList.remove('selected', 'disabled');
    document.getElementById('chanButton').classList.remove('selected', 'disabled');
    document.getElementById('leButton').classList.remove('selected', 'disabled');
}

function generateResultSequence() {
    const sequence = [];
    const taiCount = Math.floor(Math.random() * 50) + 50; // Số lần xuất hiện liên tiếp của 'tai'
    const xiuCount = Math.floor(Math.random() * 50) + 50; // Số lần xuất hiện liên tiếp của 'xiu'

    for (let i = 0; i < taiCount; i++) {
        sequence.push('tai');
    }
    for (let i = 0; i < xiuCount; i++) {
        sequence.push('xiu');
    }

    // Trộn ngẫu nhiên chuỗi kết quả nhiều lần để tăng độ khó đoán
    for (let k = 0; k < 10; k++) {
        for (let i = sequence.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
        }
    }

    resultSequence = sequence;
}

// Bắt đầu trò chơi khi trang được tải
window.onload = () => {
    generateResultSequence();
    startGame();
};
