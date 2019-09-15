const w : number = window.innerWidth
const h : number = window.innerHeight
const circles : number = 5
const scGap : number = 0.01 / circles
const colors : Array<String> = ["#1A237E", "#E65100", "#64DD17", "#9C27B0", "#f44336"]
const backColor : String = "#BDBDBD"

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n
    }
}

class DrawingUtil {

    static drawClippedCircle(context : CanvasRenderingContext2D, r : number, y : number, h : number) {
        context.beginPath()
        context.arc(0, 0, r, 0, 2 * Math.PI)
        context.clip()
        context.fillRect(-r, -r + y, 2 * r, h)
    }

    static drawColorCircle(context : CanvasRenderingContext2D, i : number, sc1 : number, sc2 : number, size : number, shouldDraw : boolean) {
        var h : number = 0
        if (sc2 > 0) {
            h = 2 * size * sc2
        }
        if (shouldDraw) {
            h = 2 * size * (1 - sc1)
        }
        context.save()
        context.translate(w / 2, i * 2 * size + size)
        DrawingUtil.drawClippedCircle(context, size, 2 * size * sc1, h)
        context.restore()
    }

    static drawCCNode(context : CanvasRenderingContext2D, i : number, scale : number, sc : number, currI : number) {
        context.fillStyle = colors[i]
        const size : number = h / (2 * circles)
        DrawingUtil.drawColorCircle(context, i, scale, sc, size, currI == i)
    }
}

class VertColorCircleStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : VertColorCircleStage = new VertColorCircleStage()
        stage.initCanvas()
        stage.render()

    }
}

class State {

    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += scGap * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {

    animated : Boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class VCCNode {

    prev : VCCNode
    next : VCCNode
    state : State = new State()

    constructor(public i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new VCCNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D, sc : number, currI : number) {
        DrawingUtil.drawCCNode(context, this.i, this.state.scale, sc, currI)
        if (this.state.scale > 0 && this.next) {
            this.next.draw(context, this.state.scale, currI)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : VCCNode {
        var curr : VCCNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr != null) {
            return curr
        }
        cb()
        return this
    }
}

class VertColorCircle {

    root : VCCNode = new VCCNode(0)
    curr : VCCNode = this.root
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context, 0, this.curr.i)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    vcc : VertColorCircle = new VertColorCircle()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.vcc.draw(context)
    }

    handleTap(cb : Function) {
        this.vcc.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.vcc.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}
