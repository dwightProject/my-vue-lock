<template>
  <div class="lock-box">
    <img src="../assets/unlock.png" alt="" class="lock-logo">
    <div class="warns" :style="{color:normalStyle.fcolor}">{{warningText}}</div>
    <canvas ref="canvas" class="canvas"></canvas>
    <div class="boxs" v-if="showBoxs"></div>
    <div class="resetBtn" @click="resetPassword">重置手势密码</div>
  </div>
</template>

<script>
  export default {
    name: 'lock-box',
    data() {
      return {
        width: 6.4, //canvas 的宽
        height: 6.4,//canvas 的高
        r: 0, // stroke圆的半径,
        rowNum: 3, // 解锁键盘每行几个stroke圆
        arcArr: [], // stroke圆的圆心坐标的数组,
        targetCo: [], // touch或者拖动 选中的 圆心坐标
        remainingCo: [], // 未被选中的 远新坐标,
        touchFlag: false, // 是否是拖动选取中
        resetStatus: false, // 是否是 重置密码 状态
        pswObj: {
          step: 1,
          savePassword: '',
          setPassword: ''
        },
        // 修改 默认样式的时候 要把methods 方法里的 initstyle　样式一起修改
        normalStyle: {
          arcColor: 'white',// stroke圆的 线条颜色
          arcLineWidth: 2 * window.devicePixelRatio,// stroke圆的 线条宽度,
          fillArcColor: 'white',
          lineColor: 'white',
          lineWidth: 8,
          fcolor: 'white'
        },
        successStyle: {
          arcColor: 'skyblue',// stroke圆的 线条颜色
          arcLineWidth: 2 * window.devicePixelRatio,// stroke圆的 线条宽度,
          fillArcColor: 'skyblue',
          lineColor: 'skyblue',
          lineWidth: 8,
          fcolor: 'skyblue'
        },
        errorStyle: {
          arcColor: 'red',// stroke圆的 线条颜色
          arcLineWidth: 2 * window.devicePixelRatio,// stroke圆的 线条宽度,
          fillArcColor: 'red',
          lineColor: 'red',
          lineWidth: 8,
          fcolor: 'red'
        },
        warningText: '请设置密码',
        showBoxs: false, //防止 touchend 结束时候 继续操作
      }
    },
    computed: {
      ctx() {
        return this.$refs.canvas.getContext('2d');
      },
      canvas() {
        return this.$refs.canvas;
      }
    },
    methods: {
      // 画stroke圆
      drawStrokeArc(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true)
        this.ctx.strokeStyle = this.normalStyle.arcColor;
        this.ctx.lineWidth = this.normalStyle.arcLineWidth;
        this.ctx.stroke()
      },
      // 画实心圆
      drawFillArc() {
        for (let i = 0; i < this.targetCo.length; i++) {
          this.ctx.beginPath();
          this.ctx.arc(this.targetCo[i].x, this.targetCo[i].y, this.r / 2.5, 0, Math.PI * 2, true);
          this.ctx.fillStyle = this.normalStyle.fillArcColor;
          this.ctx.closePath();
          this.ctx.fill();
        }
      },
      //
      drawStatusArc() {
        for (var i = 0; i < this.targetCo.length; i++) {
          this.ctx.beginPath();
          this.ctx.arc(this.targetCo[i].x, this.targetCo[i].y, this.r, 0, Math.PI * 2, true);
          this.ctx.strokeStyle = this.normalStyle.arcColor;
          this.ctx.lineWidth = this.normalStyle.arcLineWidth;
          this.ctx.closePath();
          this.ctx.stroke();
        }
      },
      // 画直线
      drawLine(co) {
        this.ctx.beginPath();
        this.ctx.lineWidth = this.normalStyle.lineWidth;
        this.ctx.strokeStyle = this.normalStyle.lineColor;
        this.ctx.moveTo(this.targetCo[0].x, this.targetCo[0].y);
        for (let i = 1; i < this.targetCo.length; i++) {
          this.ctx.lineTo(this.targetCo[i].x, this.targetCo[i].y);
        }
        this.ctx.lineTo(co.x, co.y);
        this.ctx.stroke();
        this.ctx.closePath();
      },
      // 循环出stroke圆矩阵
      createCircle() {
        this.r = this.canvas.width / (2 + 4 * this.rowNum);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let count = 0;

        this.targetCo = [];
        this.arcArr = [];
        this.remainingCo = [];

        for (let i = 0; i < this.rowNum; i++) {
          for (let j = 0; j < this.rowNum; j++) {
            count++;
            let obj = {
                x: j * 4 * this.r + 3 * this.r,
                y: i * 4 * this.r + 3 * this.r,
                index: count
              }
            ;
            this.arcArr.push(obj);
            this.remainingCo.push(obj);
          }
        }

        for (let i = 0; i < this.arcArr.length; i++) {
          this.drawStrokeArc(this.arcArr[i].x, this.arcArr[i].y);
        }
      },
      // 手指拖动选区中
      moving(co) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < this.arcArr.length; i++) {
          this.drawStrokeArc(this.arcArr[i].x, this.arcArr[i].y);
        }
        this.drawFillArc()
        this.drawLine(co);

        // 得到被 touch 到的圆
        for (let i = 0; i < this.remainingCo.length; i++) {
          if (Math.abs(co.x - this.remainingCo[i].x) < this.r && Math.abs(co.y - this.remainingCo[i].y) < this.r) {
            this.targetCo.push(this.remainingCo[i]);
            this.drawFillArc(this.remainingCo[i].x, this.remainingCo[i].y);
            this.remainingCo.splice(i, 1);
            break;
          }
        }

      },
      // 检测密码是否一致
      checkPass(oldPsw, newPsw) {
        let p1 = '';
        let p2 = '';
        for (var i = 0; i < oldPsw.length; i++) {
          p1 += oldPsw[i].index + oldPsw[i].index;
        }
        for (var i = 0; i < newPsw.length; i++) {
          p2 += newPsw[i].index + newPsw[i].index;
        }
        return p1 === p2;
      },

      // 结束拖动选取时，存储密码判断
      storePass(psw) {
        if (psw.length < 4) {
          this.warningText = '密码最少要四个格子';
          return;
        } else {
          if (this.pswObj.step == 1) {
            if (this.pswObj.savePassword) {
              if (this.checkPass(this.pswObj.savePassword, psw)) {
                this.pswObj.step = 2;
                this.pswObj.setPassword = psw;
                this.warningText = '密码保存成功';
                this.lockStatus('suc')
                window.localStorage.setItem('setPassword', JSON.stringify(this.pswObj.setPassword));
              } else {
                this.warningText = '两次密码输入不一致';
                this.initPswObj();
                this.lockStatus('err')
                setTimeout(() => {
                  this.warningText = '请重新输入';
                }, 500)
              }
            } else {
              this.pswObj.savePassword = psw;
              this.warningText = '请输入第二遍'
            }
          } else if (this.pswObj.step == 2) {
            if (this.resetStatus) {
              if (this.checkPass(this.pswObj.setPassword, psw)) {
                window.localStorage.removeItem('');
                this.initPswObj();
                this.lockStatus('suc');
                this.warningText = '请设置新密码'
                this.resetStatus = false;
              } else {
                this.lockStatus('err');
                this.warningText = '旧密码输入错误，重新输入';
              }
            } else {
              if (this.checkPass(this.pswObj.setPassword, psw)) {
                this.warningText = '解锁成功';
                this.lockStatus('suc');
              } else {
                this.warningText = '解锁失败请重新输入';
                this.lockStatus('err')
              }
            }
          }
        }
      },
      makeState() {
        if (this.pswObj.step == 2) {
          this.warningText = '请解锁';
        }
      },
      // 每一次 touchend 结束时候 重置 canvas
      reset() {
        this.showBoxs = false;
        this.initStyle()
        this.makeState();
        this.createCircle();
      },
      lockStatus(val) {
        let status = '';
        if (val == 'suc') {
          status = this.successStyle
          this.normalStyle.fcolor = this.successStyle.fcolor
        }
        if (val == 'err'){
          status = this.errorStyle
          this.normalStyle.fcolor = this.errorStyle.fcolor
        }
        this.normalStyle.lineColor = status.lineColor;
        this.normalStyle.fillArcColor = status.fillArcColor;
        this.normalStyle.arcColor = status.arcColor;
        this.drawLine(this.targetCo[this.targetCo.length - 1])
        this.drawFillArc()
        this.drawStatusArc()
      },
      // 发生设置错误时重置存储对象
      initPswObj() {
        this.pswObj = {
          step: 1,
          savePassword: '',
          setPassword: ''
        }
      },
      initObj() {
        let obj = window.localStorage.getItem('setPassword');
        if (obj) {
          this.pswObj = {
            step: 2,
            setPassword: JSON.parse(window.localStorage.getItem('setPassword')),
            savePassword: ''
          }
        }
      },
      initStyle() {
        this.normalStyle = {
          arcColor: 'white',// stroke圆的 线条颜色
          arcLineWidth: 2 * window.devicePixelRatio,// stroke圆的 线条宽度,
          fillArcColor: 'white',
          lineColor: 'white',
          lineWidth: 8,
          fcolor: 'white'
        }
      },
      initDom() {
        let width = this.width || 6.4;
        let height = this.height || 6.4;
        // 高清屏锁放
        this.canvas.style.width = width + "rem";
        this.canvas.style.height = height + "rem";
        this.canvas.height = height * window.devicePixelRatio * (100 * window.screen.width / 750);
        this.canvas.width = width * window.devicePixelRatio * (100 * window.screen.width / 750);
      },
      initEvent() {
        this.canvas.addEventListener("touchstart", (e) => {

          // 某些android 的 touchmove不宜触发 所以增加此行代码
          e.preventDefault();
          let co = this.getCoordinate(e);

          // 得到被 touch 到的圆
          for (let i = 0; i < this.arcArr.length; i++) {
            if (Math.abs(co.x - this.arcArr[i].x) < this.r && Math.abs(co.y - this.arcArr[i].y) < this.r) {
              this.targetCo.push(this.arcArr[i]);
              this.remainingCo.splice(i, 1);
              this.drawFillArc(this.arcArr[i].x, this.arcArr[i].y);
              this.touchFlag = true;
              break;
            }
          }

        })

        this.canvas.addEventListener("touchmove", (e) => {
          if (this.touchFlag) {
            this.moving(this.getCoordinate(e));
          }
        })

        this.canvas.addEventListener("touchend", (e) => {
          if (this.touchFlag) {
            this.touchFlag = false;
            this.storePass(this.targetCo);
            this.showBoxs = true
            setTimeout(() => {
              this.reset();
            }, 1000);

          }
        });

      },
      // 获取canvas 上 touch点的 坐标
      getCoordinate(e) {
        var rect = e.currentTarget.getBoundingClientRect();
        var co = {
          x: (e.touches[0].clientX - rect.left) * window.devicePixelRatio,
          y: (e.touches[0].clientY - rect.top) * window.devicePixelRatio
        }
        return co;
      },
      // 重置密码
      resetPassword() {
        if (window.localStorage.getItem('setPassword') && this.pswObj.step == 2) {
          this.reset();
          this.warningText = '请先输入一次旧密码';
          this.resetStatus = true
        }
      },
    },
    mounted() {
      this.initDom()
      this.initObj()
      this.makeState();
      this.createCircle()
      this.initEvent()
    }
  }
</script>
<style scoped lang="scss">
  .lock-box {
    position: fixed;
    left: 0;
    top: 0px;
    right: 0px;
    bottom: 0px;
    margin: auto;
    background: url("../assets/lock-bg.png") no-repeat;
    background-size: cover;
    .lock-logo {
      width: 1.5rem;
      height: 1.5rem;
      margin-top: 1rem;
    }
    .canvas {
      margin:0 auto;
    }
    .warns {
      width: 100%;
      text-align: center;
      font-size: 0.32rem;
    }
    .boxs {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      margin: auto;
      z-index: 99;
    }
    .resetBtn {
      width: 100%;
      position: absolute;
      left: 0;
      bottom: 0.4rem;
      font-size: 0.28rem;
      text-align: center;
      color: white;
    }
  }
</style>
