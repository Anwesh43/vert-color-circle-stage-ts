const w : number = window.innerWidth
const h : number = window.innerHeight
const circles : number = 5
const scGap : number = 0.01 / circles
const colors : Array<String> = ["#1A237E", "#E65100", "#64DD17", "#9C27B0", "#f44336"]
const backColor : String = "#BDBDBD"

class VertColorCircleStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : VertColorCircleStage = new VertColorCircleStage()
        stage.initCanvas()
        stage.render()

    }
}
