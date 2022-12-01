import React, {Component} from "react";
import {dijkstra} from "./Dijkstra";
import './main-component.css';

export class MainComponent extends Component {

    constructor(props) {
        super(props);
        this.ctx = null;
        this.canvasRef = React.createRef();
        this.positionXRef = React.createRef();
        this.state = this.initialState(
            {
                aristas: [
                    ["Valledupar", "Barranquilla"],
                    ["Barranquilla", "Valledupar"],
    
                    ["Valledupar", "SantaMarta"],
                    ["SantaMarta", "Valledupar"],
    
                    ["Valledupar", "Sincelejo"],
                    ["Sincelejo", "Valledupar"],
                    
                    ["Valledupar", "Medellin"],
                    ["Medellin", "Valledupar"],
            
                    ["Medellin", "Barranquilla"],
                    ["Barranquilla", "Medellin"],
                    
                    ["Medellin", "SantaMarta"],
                    ["SantaMarta", "Medellin"],
                    
                    ["Medellin", "Sincelejo"],
                    ["Sincelejo", "Medellin"],
                    
            
                    ["Sincelejo", "SantaMarta"],
                    ["SantaMarta", "Sincelejo"],
                    
                    ["Sincelejo", "Barranquilla"],
                    ["Barranquilla", "Sincelejo"],
            
                    
                    ["SantaMarta", "Barranquilla"],
                    ["Barranquilla", "SantaMarta"],
                ],
                coordenadas: {
                    Valledupar: [80, 5],
                    SantaMarta: [50, 95],
                    Barranquilla: [95, 50],
                    Sincelejo: [5, 50],
                    Medellin: [20, 5]
                },
                grafo: {
                    Valledupar: {
                        SantaMarta: 95,
                        Barranquilla: 47,
                        Sincelejo: 87,
                        Medellin: 60
                      },
                      SantaMarta: {
                        Valledupar: 95,
                        Barranquilla: 64,
                        Sincelejo: 64,
                        Medellin: 95
                      },
                      Barranquilla: {
                        Valledupar: 47,
                        SantaMarta: 64,
                        Sincelejo: 90,
                        Medellin: 87
                      },
                      Sincelejo: {
                        Valledupar: 87,
                        SantaMarta: 64,
                        Barranquilla: 90,
                        Medellin: 47
                      },
                      Medellin: {
                        Valledupar: 60,
                        SantaMarta: 95,
                        Barranquilla: 87,
                        Sincelejo: 47
                      }
                }
            }
        );
    }

    initialState = (s) => {
        return {
            ...(s ? s : {
                grafo: { },
                coordenadas: { },
                aristas: [ ]
            }),
            form: 'destinos',
            distance: { },
            ...this.emptyFormsControls(),
            rutaOptima: { },
        };
    }
    emptyFormsControls() {
        return {
            destino: {
                x: '',
                y: '',
                nombre: ''
            },
            ruta: {
                inicio: '',
                final: '',
            },
            calculo: {
                partida: '',
                llegada: '',
            },
        }
    }
    clearFormsControls = () => {
        this.setState({...this.emptyFormsControls()});
    }
    drawGrid = (size = 600) => {
        this.ctx.strokeStyle = "#F5F5F5";

        for (let x = 0; x <= size; x += 6) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, size);
        }

        for (let y = 0; y <= size; y += 6) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(size, y);
        }
        this.ctx.stroke();
    }
    emptyCanvas = (size = 600) => {
        this.canvasRef.current.width = size;
        this.drawGrid();
    }
    sizeCanvas = (size = 600) => {
        this.canvasRef.current.width = size;
        this.canvasRef.current.height = size;
    }

    setFocusPositionX = () => {
        this.positionXRef?.current?.focus();
    }

    drawVertex = (x, y, r = 7, nameOfVertex, size = 600) => {
        let escala = Math.round(size / 100);
        let xPixel = x * escala;
        let yPixel = y * escala;

        if (this.ctx) {
            this.ctx.textAlign = "center";
            this.ctx.font = "10pt Verdana";
            this.ctx.fillStyle = "#000000";
            this.ctx.fillText(nameOfVertex, xPixel, size - yPixel + 23);

            this.ctx.fillStyle = "#7030A0";
            this.ctx.beginPath();
            this.ctx.arc(xPixel, size - yPixel, r, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }
    drawEdge = (x1, y1, x2, y2, weight = null, size = 600, optimalRoute = false ) => {
        let escala = Math.round(size / 100);
        let x1Pixel = x1 * escala;
        let y1Pixel = y1 * escala;
        let x2Pixel = x2 * escala;
        let y2Pixel = y2 * escala;
        let xMedioPixel = Math.round(((x1 + x2) / 2) * escala);
        let yMedioPixel = Math.round(((y1 + y2) / 2) * escala);

        if (this.ctx) {
            if (optimalRoute) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = "#C00303";
            } else {
                this.ctx.textAlign = "center";
                this.ctx.font = "10pt Verdana";
                this.ctx.fillStyle = "#000000";
                this.ctx.fillText(weight, xMedioPixel + 15, size - yMedioPixel);
                this.ctx.strokeStyle = "#7030A0";
            }

            this.ctx.lineWidth = 3;
            this.ctx.moveTo(x1Pixel, size - y1Pixel);
            this.ctx.lineTo(x2Pixel, size - y2Pixel);
            this.ctx.stroke();
        }
    }
    showForm = (form) => {
        this.setState({ form }, () => this.setFocusPositionX())
    }

    clearButtonOnClick = () => {
        this.setState(this.initialState(), () => this.emptyCanvas());
    }
    addVertex = (x, y, nameV) => {
        this.setState( {
            coordenadas: {...this.state.coordenadas, [nameV]: [x, y]},
            grafo: {...this.state.grafo, [nameV]: {}},
            ...this.emptyFormsControls()
        }, () => {
            this.drawVertex(x, y, 7, nameV);
            this.setFocusPositionX();
        });
    };
    addEdge = (x1, y1, x2, y2, peso, initialV, finalV) => {
        this.setState( {
                grafo: {
                    ...this.state.grafo,
                    [initialV]: {
                        ...this.state.grafo[initialV],
                        [finalV]: peso
                    },
                    [finalV]: {
                        ...this.state.grafo[finalV],
                        [initialV]: peso
                    }
                },
                aristas: [...this.state.aristas, [initialV, finalV], [finalV, initialV]],
                ...this.emptyFormsControls()
            }, () => this.drawEdge(x1, y1, x2, y2, peso)
        );
    }
    crearVOnClick = () => {

        const x = parseInt(this.state.destino.x);
        const y = parseInt(this.state.destino.y);
        const nameV = this.state.destino.nombre;
        const coordenadas = this.state.coordenadas;

        if (x >= 0 && y >= 0 && x <= 100 && y <= 100 &&
            nameV != "" && x != null && y != null && nameV != null
        ) {
            let existe = false;
            let queExiste = "";

            if (Object.keys(coordenadas).length > 0) {
                // Valida que las coordenadas no existan ya en el grafo.
                for (const vertice in coordenadas) {
                    for (let i = 0; i < coordenadas[vertice].length; i++) {
                        if (coordenadas[vertice][0] == x && coordenadas[vertice][1] == y) {
                            existe = true;
                            queExiste += `Ya existen las coordenadas (${x},${y}) `;
                            i = coordenadas[vertice].length;
                        }
                    }
                }

                // Valida que el nombre del vertice a ingresar no tenga el mismo nombre que alguno ya almacenado.
                if ([nameV] in this.state.grafo) {
                    existe = true;
                    queExiste += `Ya existe un vertice con el nombre ${nameV}`;
                }
                if (!existe) {
                    this.addVertex(x, y, nameV);
                } else {
                    alert(queExiste);
                }
            } else {
                this.addVertex(x, y, nameV);
            }
        } else {
            alert("Por favor introduce datos correctos");
        }

        this.clearFormsControls();
    }
    crearEOnClick = () =>{
        const initialV = this.state.ruta.inicio;
        const finalV = this.state.ruta.final;
        const aristas = this.state.aristas;

        if (initialV != "" && finalV != "" && initialV != null && finalV != null) {
            if (initialV != finalV) {
                let x1 = this.state.coordenadas[initialV][0];
                let y1 = this.state.coordenadas[initialV][1];
                let x2 = this.state.coordenadas[finalV][0];
                let y2 = this.state.coordenadas[finalV][1];
                let peso = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                peso = Math.round(peso);

                if (this.state.aristas.length > 0) {
                    let existe = false;
                    let queExiste = `Ya existe una arista desde el vértice ${initialV} hasta el vértice ${finalV}.`;

                    for (let i = 0; i < this.state.aristas.length; i++) {
                        if (
                            (aristas[i][0] == initialV && aristas[i][1] == finalV) ||
                            (aristas[i][0] == finalV && aristas[i][1] == initialV)
                        ) {
                            existe = true;
                            i = aristas.length;
                        }
                    }

                    if (!existe) {
                        this.addEdge(x1, y1, x2, y2, peso, initialV, finalV);
                    } else {
                        alert(queExiste);
                    }
                } else {
                    this.addEdge(x1, y1, x2, y2, peso, initialV, finalV);
                }
            } else {
                alert(
                    `No se puede conectar ${initialV} con ${finalV}, ya que son los mismos vértices. El sistema no lo acepta.`
                );
            }
        } else {
            alert("Por favor introduce los datos.");
        }

        this.clearFormsControls();
    }
    calcRouteOnClick = () => {
        const initialV = this.state.calculo.partida;
        const finalV = this.state.calculo.llegada;
        const coordenadas = this.state.coordenadas;

        console.log(this.state);

        this.emptyCanvas();
        this.redrawVertices();
        this.redrawAristas();


        if (initialV != "" && finalV != "" && initialV != null && finalV != null) {
            if (initialV != finalV) {
                let dks = dijkstra(this.state.grafo, initialV, finalV);
                let distance = dks["distancia"];
                let route = dks["ruta"];

                console.log(dks);

                for (let i = 0; i < route.length; i++) {
                    if (i < route.length - 1) {
                        this.drawEdge(
                            coordenadas[route[i]][0],
                            coordenadas[route[i]][1],
                            coordenadas[route[i + 1]][0],
                            coordenadas[route[i + 1]][1],
                            null,
                            600,
                            true
                        );

                        this.setState({
                            rutaOptima: {
                                distancia: distance,
                                ruta: route
                            }
                        })
                    }
                }

            } else {
                alert("¡Ya estás en tu destino!");
            }
        } else {
            alert("Por favor introduce los datos.");
        }



        this.clearFormsControls();
    }

    redrawVertices() {
        for (let nameV in this.state.coordenadas) {
            let x = this.state.coordenadas[nameV][0];
            let y = this.state.coordenadas[nameV][1];
            this.drawVertex(x, y, 7, nameV);
        }
    }

    redrawAristas() {
        let aristas = this.state.aristas.filter((v, i, _) => i % 2 === 0);
        console.log(aristas)
        for (let arista of aristas) {
            let x1 = this.state.coordenadas[arista[0]][0];
            let y1 = this.state.coordenadas[arista[0]][1];
            let x2 = this.state.coordenadas[arista[1]][0];
            let y2 = this.state.coordenadas[arista[1]][1];
            let peso = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            peso = Math.round(peso);
            this.drawEdge(x1, y1, x2, y2, peso)
        }
    }


    componentDidMount() {
        this.ctx = this.canvasRef.current.getContext("2d");
        this.sizeCanvas();
        this.drawGrid();

        this.emptyCanvas();
        this.redrawVertices();
        this.redrawAristas();
    }

    options = (prefix) => {
        let options = [<option key={`${prefix}-empty`}>...</option>];
        options.push(...Object.keys(this.state.coordenadas).map(x => <option value={x} key={`${prefix}-${x}`}>{x}</option>));
        return options;
    }

    changeValue = (section, field, value) => {
        this.setState({
            [section]: {
                ...this.state[section],
                [field]: value
            }
        })
    }

    canvas = () => {
        return <div className="divMapa">
                    <canvas id="mapa" ref={this.canvasRef}></canvas>
                </div>;
    }
    buttons = () => {
        return <div className="buttones">
                    <button id="btnCreateVertice" className=" btn btn-primary" onClick={() => this.showForm('destinos')}>Agregar Destinos</button>
                    <button id="btnCreateEdge" className="btn btn-warning" onClick={() => this.showForm('crear-ruta')}>Crear Ruta</button>
                    <button id="btnRoute" className="btn btn-success" onClick={() => this.showForm('calcular-ruta')}>Calcular Ruta</button>
                </div>;
    }
    buttonClear = () => {
        return <button id="btnClear" className="btnClear btn btn-danger"
                       onClick={this.clearButtonOnClick}>
                    Limpiar
                </button>;
    }
    currentForm = () => {
        switch (this.state.form) {
            case 'destinos':
                return <form action="#" className="formVertices form">
                    <label htmlFor="positionVertice">Posición del Destino en coordenadas (x,y)</label>
                    <div className="formRow">
                        <input type="number" id="positionX" min="0" max="100" placeholder="X" value={this.state.destino.x} ref={this.positionXRef}
                               onChange={(e) => this.changeValue('destino', 'x', e.target.value)} />
                        <input type="number" id="positionY" min="0" max="100" placeholder="Y" value={this.state.destino.y}
                               onChange={(e) => this.changeValue('destino', 'y', e.target.value)} />
                    </div>

                    <label htmlFor="nameVertice">Nombre del Destino</label>
                    <div className="formRow">
                        <input type="text" id="nameVertice" value={this.state.destino.nombre} onChange={(e) => this.changeValue('destino', 'nombre', e.target.value)}/>
                        <button type="button" id="btnCrearV" value="Crear vértice"
                                className="btn btn-primary" onClick={this.crearVOnClick}>Guardar
                        </button>
                    </div>
                </form>;
            case 'crear-ruta':
                return <form action="#" className="formEdges form">
                    <label htmlFor="initialV">Inicio</label>
                    <select id="initialV" onChange={(e) => this.changeValue('ruta', 'inicio', e.target.value)} value={this.state.ruta.inicio}>
                        {this.options("initialV")}
                    </select>

                    <label htmlFor="finalV">Final</label>
                    <select id="finalV" onChange={(e) => this.changeValue('ruta', 'final', e.target.value)} value={this.state.ruta.final}>
                        {this.options("finalV")}
                    </select>

                    <button type="button" id="btnCrearE" className="btn btn-primary mt-3" onClick={this.crearEOnClick}>Crear arista</button>
                </form>;
            case 'calcular-ruta':
                return <form action="#" className="formCalculate form"  key={'form-calcular-rutas'}>
                    <label htmlFor="initialVC">Punto de Partida</label>
                    <select id="initialVC" onChange={(e) => this.changeValue('calculo', 'partida', e.target.value)} value={this.state.calculo.partida}>
                        {this.options("initialVC")}
                    </select>

                    <label htmlFor="finalVC">Punto de Llegada</label>
                    <select id="finalVC" onChange={(e) => this.changeValue('calculo', 'llegada', e.target.value)} value={this.state.calculo.llegada}>
                        {this.options("finalVC")}
                    </select>

                    <button type="button" id="btnCalcRoute" className="btn btn-primary mt-3" onClick={this.calcRouteOnClick}>Calcular ruta</button>
                </form>;
            default:
                return <div></div>
        }
    }
    distanceText = () => {
        return ( (this.state.rutaOptima.ruta && this.state.rutaOptima.distancia) && <p id="distance">
                    <strong>Distancia recorrida:</strong>{this.state.rutaOptima.distancia} <br/><strong>Ruta:</strong> ({this.state.rutaOptima.ruta.join(', ')})
                </p>);
    }

    render() {
        return (
            <section className="principalContainer">
                <div className="divBotones">
                    {this.buttons()}
                    {this.currentForm()}
                    {this.distanceText()}
                    {this.buttonClear()}
                </div>
                {this.canvas()}
            </section>
        );
    }
}