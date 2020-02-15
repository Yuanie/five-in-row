// 全局变量
const chess = document.getElementById('chess')
const ctx = chess.getContext('2d')
let over = false

ctx.strokeStyle = '#BFBFBF'
const button = document.getElementById('btn')
const result = document.getElementsByClassName('result')[0]
// 检查棋盘某点是否有子的2维数组
let chessBoard = []
// 赢法个数
let count = 0
// 剩余可下棋的位置个数
let remainNumbers = 0
// 初始化
for (let i = 0; i < 15; i++) {
  chessBoard[i] = []
  for (let j = 0; j < 15; j++) {
    chessBoard[i][j] = 0
  }
}
let wins = (function() {
  // 定义赢法3维数组
  let wins = []

  // 前2维表示坐标位置 最后一维表示一种赢的方式
  // 先初始化前两维数组
  for (let i = 0; i < 15; i++) {
    wins[i] = []
    for (let j = 0; j < 15; j++) {
      wins[i][j] = []
    }
  }

  // 横线连成5个的赢法
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 11; j++) {
      for (let k = 0; k < 5; k++) {
        wins[i][j + k][count] = true
      }
      count++
    }
  }

  // 竖线连成5个的赢法
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 11; j++) {
      for (let k = 0; k < 5; k++) {
        wins[j + k][i][count] = true
      }
      count++
    }
  }

  // 正斜线连成5个的赢法
  for (let i = 0; i < 11; i++) {
    for (let j = 0; j < 11; j++) {
      for (let k = 0; k < 5; k++) {
        wins[i + k][j + k][count] = true
      }
      count++
    }
  }

  // 反斜线连成5个的赢法
  for (let i = 0; i < 11; i++) {
    for (let j = 14; j > 3; j--) {
      for (let k = 0; k < 5; k++) {
        wins[i + k][j - k][count] = true
      }
      count++
    }
  }
  return wins
})()
// 赢法统计数组
let myWin = [],
  computerWin = []
// 初始化
for (let i = 0; i < count; i++) {
  myWin[i] = 0
  computerWin[i] = 0
}
let logo = new Image()
logo.src = './img/logo3.jpg'
// 保存表示玩家先后的变量
let me = confirm('是否先行?')
// 此刻先行变量
// true表示始终以黑棋先行
let now = true
logo.onload = function() {
  ctx.drawImage(logo, 0, 0, 450, 450)
  drawChessBoard()
  if (!me) {
    // 计算机在正中间下一棋
    oneStep(7, 7, now)
    now = !now
  }
  addEvent()
}

/*
// 模糊化logo
let blur = function (ele, src, strength) {
  // 背景logo
  let logo = new Image();
  logo.onload = function () {
    ctx.drawImage(this, 0, 0)
    ctx.globalAlpha = 0.7;
    // Add blur layers by strength to x and y  
    // 2 made it a bit faster without noticeable quality loss  
    for (let y = -strength; y <= strength; y += 2) {
      for (let x = -strength; x <= strength; x += 2) {
        ctx.drawImage(chess, x, y);
      }
    }
    ctx.globalAlpha = 1;
    ele.style.backgroundImage = 'url(' + chess.toDataURL() + ')';
  }
  logo.src = src;
}
*/

let restartGame = function() {
  // 偷懒 直接实现页面刷新
  result.innerHTML = ''
  window.location.reload()
}

let drawChessBoard = function() {
  for (let i = 0; i < 15; i++) {
    // 15个棋子放置点 宽高为450px
    // 14个空白 每个空白30px 两边各留有15px
    // 画竖线
    ctx.moveTo(15 + i * 30, 15)
    ctx.lineTo(15 + i * 30, 450 - 15)
    ctx.stroke()
    // 画横线
    ctx.moveTo(15, 15 + i * 30)
    ctx.lineTo(450 - 15, i * 30 + 15)
    ctx.stroke()
  }
}

let oneStep = function(i, j, state) {
  // 在i, j 处下一步棋
  // now 为true则表示黑棋
  let circleX = 15 + i * 30,
    circleY = 15 + j * 30,
    radius = 13
  ctx.beginPath()
  ctx.arc(circleX, circleY, radius, 0, Math.PI * 2)
  ctx.closePath()
  // 绘制一个矩形，并用放射状/圆形渐变进行填充
  // context.createRadialGradient(x0,y0,r0,x1,y1,r1)
  // x0	渐变的开始圆的 x 坐标
  // y0	渐变的开始圆的 y 坐标
  // r0	开始圆的半径
  // x1	渐变的结束圆的 x 坐标
  // y1	渐变的结束圆的 y 坐标
  // r1	结束圆的半径
  let gradient = ctx.createRadialGradient(
    circleX + 2,
    circleY - 2,
    radius,
    circleX + 2,
    circleY - 2,
    0
  )
  if (state) {
    gradient.addColorStop(0, '#0A0A0A')
    gradient.addColorStop(1, '#666666')
  } else {
    gradient.addColorStop(0, '#D1D1D1')
    gradient.addColorStop(1, '#F9F9F9')
  }

  ctx.fillStyle = gradient
  ctx.fill()
}

let computerAI = function() {
  // 在计算机落子前先判断是否可以下棋
  if (remainNumbers === 0) {
    result.innerHTML = 'stalemate!'
    return
  }
  let myScore = [],
    computerScore = [],
    // 保存最高分
    maxScore = 0,
    // 保存最高分坐标
    [u, v] = [0, 0]

  for (let i = 0; i < 15; i++) {
    myScore[i] = []
    computerScore[i] = []
    for (let j = 0; j < 15; j++) {
      myScore[i][j] = 0
      computerScore[i][j] = 0
    }
  }

  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
      if (chessBoard[i][j] === 0) {
        for (let k = 0; k < count; k++) {
          if (wins[i][j][k]) {
            switch (myWin[k]) {
              case 1:
                myScore[i][j] += 10
                break
              case 2:
                myScore[i][j] += 20
                break
              case 3:
                myScore[i][j] += 50
                break
              case 4:
                myScore[i][j] += 500
                break
            }

            switch (computerWin[k]) {
              case 1:
                computerScore[i][j] += 12
                break
              case 2:
                computerScore[i][j] += 24
                break
              case 3:
                computerScore[i][j] += 58
                break
              case 4:
                computerScore[i][j] += 1000
                break
            }
          }
        }
        // myScore中寻找最大坐标
        if (myScore[i][j] > maxScore) {
          // 如果计算机发现myScore比最高分还高
          // 则想办法阻拦
          maxScore = myScore[i][j]
          u = i
          v = j
        } else if (myScore[i][j] === maxScore) {
          if (computerScore[i][j] > computerScore[u][v]) {
            // 如果myScore已经是最高分
            // 那么计算机就找computerScore最高的位置
            u = i
            v = j
          }
        }
        // computerScore中寻找最大坐标
        if (computerScore[i][j] > maxScore) {
          // 如果计算机发现走这步棋分比最高分还高
          // 则走下这步棋
          maxScore = computerScore[i][j]
          u = i
          v = j
        } else if (computerScore[i][j] === maxScore) {
          if (myScore[i][j] > myScore[u][v]) {
            // 当计算机得分已经是最高分
            // 为了不让人赢 则找myScore最高的位置
            u = i
            v = j
          }
        }
      }
    }
  }

  oneStep(u, v, now)
  // 计算机在此落子
  chessBoard[u][v] = -1
  for (let k = 0; k < count; k++) {
    if (wins[u][v][k]) {
      // 计算机++
      computerWin[k]++
      // 人在此已赢不了了
      // 赋值为一个不可能的值
      myWin[k] = 6
      if (computerWin[k] === 5) {
        over = true
        setTimeout(() => {
          result.innerHTML = 'sorrt, you lose!'
        }, 500)
      }
    }
  }
  if (!over) {
    now = !now
  }
}

let addEvent = function() {
  button.addEventListener('click', () => {
    restartGame()
  })

  // 鼠标点击落子
  chess.onclick = e => {
    // 如果游戏结束
    // 则直接返回
    if (over) {
      return
    } else if (remainNumbers === 0) {
      // 如果剩余下棋个数为0 则为和棋
      result.innerHTML = 'stalemate!'
      return
    } else if (me !== now) {
      // 切换为计算机下棋
      return
    }
    let [x, y] = [e.offsetX, e.offsetY]
    // 在直径范围内点击都算落子
    // 无符号右移0位相当于 Math.floor
    let [i, j] = [(x / 30) >>> 0, (y / 30) >>> 0]
    if (chessBoard[i][j] === 0) {
      // 可以落子
      oneStep(i, j, now)
      // 如果落下为黑子 则赋值为1
      chessBoard[i][j] = 1
      for (let k = 0; k < count; k++) {
        if (wins[i][j][k]) {
          myWin[k]++
          // 计算机在此已赢不了了
          // 赋值为一个不可能的值
          computerWin[k] = 6
          if (myWin[k] === 5) {
            over = true
            setTimeout(() => {
              result.innerHTML = 'You win!'
            }, 500)
          }
        }
      }
      if (!over) {
        // 计算机开始下棋
        now = !now
        computerAI()
      }
    }
  }
}
