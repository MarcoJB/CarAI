class GPUController {
    constructor(canvas, trackBorders, cars) {
        this.canvas = canvas
        this.trackBorders = trackBorders
        this.cars = cars
        this.originalCars = JSON.parse(JSON.stringify(cars))

        this.svg = document.querySelector("#carsSVG")
        const initialCar = this.svg.querySelector(".car")
        this.cars.forEach((car, index) => {
            if (index < game.simulation.numberOfDisplayedCars) this.svg.appendChild(initialCar.cloneNode(true))
        })
        this.svg.removeChild(initialCar)

        this.ANNConfig = [6,5,4,3,2]
        this.weights = []
        this.biases = []

        for (let layer = 0; layer < this.ANNConfig.length-1; layer++) {
            this.weights[layer] = []
            this.biases[layer] = []
            
            for (let car = 0; car < cars.length; car++) {
                this.weights[layer][car] = []
                this.biases[layer][car] = []

                for (let i = 0; i < this.ANNConfig[layer + 1]; i++) {
                    this.weights[layer][car][i] = []
                    this.biases[layer][car][i] = Math.random() * 2 - 1

                    for (let j = 0; j < this.ANNConfig[layer]; j++) {
                        this.weights[layer][car][i][j] = Math.random() * 2 - 1
                    }
                }
            }
        }

        console.log(this.weights, this.biases)

        const gl = canvas.getContext('webgl2', { premultipliedAlpha: true })
        this.gpu = new GPU({
            canvas,
            context: gl
        })

        this.gpu.addFunction(function addVectors(vector1, vector2) {
            return [vector1[0] + vector2[0], vector1[1] + vector2[1]]
        })

        this.gpu.addFunction(function subtractVectors(vector1, vector2) {
            return [vector1[0] - vector2[0], vector1[1] - vector2[1]]
        })

        this.gpu.addFunction(function dotVectors(vector1, vector2) {
            return vector1[0] * vector2[0] + vector1[1] * vector2[1]
        })

        this.gpu.addFunction(function rotateVector(vector, angle) {
            return [
                vector[1] * Math.sin(angle) + vector[0] * Math.cos(angle),
                vector[1] * Math.cos(angle) - vector[0] * Math.sin(angle),
            ]
        })

        this.gpu.addFunction(function multiplyVector(vector, factor) {
            return [vector[0] * factor, vector[1] * factor]
        })

        this.gpu.addFunction(function vectorLength(vector) {
            return Math.sqrt(vector[0]**2 + vector[1]**2)
        })

        this.gpu.addFunction(function norm(vector) {
            const length = vectorLength(vector)
            return [vector[0] / length, vector[1] / length]
        })
        

        this.trackborderMatrix = []
        trackBorders[0].points.forEach((point, index) => this.trackborderMatrix.push([
            point.x, point.y, 
            trackBorders[1].points[index].x, trackBorders[1].points[index].y
        ]))


        // #### Kernel: Translate borders to viewpoint of car center ####
        this.translateBorders = this.gpu.createKernel(function(cars, trackBorders) {
            // if car not active, no further calculations needed
            if (cars[this.thread.z][6] === 0) return 0
            
            const carPosition = cars[this.thread.z][this.thread.x % 2]
            const trackPoint = trackBorders[this.thread.y][this.thread.x]
            return trackPoint - carPosition
        }, {
            output: [4, this.trackborderMatrix.length, cars.length],
            pipeline: true
        })


        // #### Kernel: Calculate rotation matrixes ####
        this.calcRotationMatrixes = this.gpu.createKernel(function(cars) {
            // if car not active, no further calculations needed
            if (cars[this.thread.z][6] === 0) return 0
            
            if ((this.thread.x <= 1 && this.thread.y > 1) || (this.thread.x > 1 && this.thread.y <= 1)) {
                return 0
            }

            if (this.thread.x % 2 === 0) {
                if (this.thread.y % 2 === 0) return Math.cos(cars[this.thread.z][4])
                else return Math.sin(cars[this.thread.z][4])
            } else {
                if (this.thread.y % 2 === 0) return -Math.sin(cars[this.thread.z][4])
                else return Math.cos(cars[this.thread.z][4])
            }
        }, {
            output: [4, 4, cars.length],
            pipeline: true
        })

        // #### Kernel: Calculate rotation matrixes for diagonal sensors ####
        this.calcRotationMatrixesDiagonal = this.gpu.createKernel(function(cars) {
            // if car not active, no further calculations needed
            if (cars[this.thread.z][6] === 0) return 0
            
            if ((this.thread.x <= 1 && this.thread.y > 1) || (this.thread.x > 1 && this.thread.y <= 1)) {
                return 0
            }

            if (this.thread.x % 2 === 0) {
                if (this.thread.y % 2 === 0) return Math.cos(cars[this.thread.z][4] + Math.PI / 4)
                else return Math.sin(cars[this.thread.z][4] + Math.PI / 4)
            } else {
                if (this.thread.y % 2 === 0) return -Math.sin(cars[this.thread.z][4] + Math.PI / 4)
                else return Math.cos(cars[this.thread.z][4] + Math.PI / 4)
            }
        }, {
            output: [4, 4, cars.length],
            pipeline: true
        })


        // #### Kernel: Rotate borders to viewpoint of car center ####
        this.rotateBorders = this.gpu.createKernel(function(borders, rotationMatrixes, cars) {
            // if car not active, no further calculations needed
            if (cars[this.thread.z][6] === 0) return 0
            
            let sum = 0
            for (let i = 0; i < 4; i++) {
                sum += borders[this.thread.z][this.thread.y][i] 
                    * rotationMatrixes[this.thread.z][this.thread.x][i]
            }
            return sum
        }, {
            output: [4, this.trackborderMatrix.length, cars.length],
            pipeline: true
        })


        // #### Kernel: Translate borders to viewpoint of car sensor in local coordinate system ####
        this.localTranslateBorders = this.gpu.createKernel(function(borders, cars) {
            // if car not active, no further calculations needed
            if (cars[this.thread.z][6] === 0) return 0
            
            const translationVector = [-5, 0, -5, 0]
            return borders[this.thread.z][this.thread.y][this.thread.x] + translationVector[this.thread.x]
        }, {
            output: [4, this.trackborderMatrix.length, cars.length],
            pipeline: true
        })


        // #### Kernel: Calculates collisions of ray 1 and borders ####
        this.calcRay1Collisions = this.gpu.createKernel(function(borders, cars) {
            // if car not active, no further calculations needed
            if (cars[this.thread.z][6] === 0) return 0
            
            let point1 = [
                borders[this.thread.z][this.thread.y][2 * this.thread.x],
                borders[this.thread.z][this.thread.y][2 * this.thread.x + 1]
            ]
            let point2 = [
                borders[this.thread.z][(this.thread.y + 1) % this.output.y][2 * this.thread.x],
                borders[this.thread.z][(this.thread.y + 1) % this.output.y][2 * this.thread.x + 1]
            ]

            // if both points are behind sensor -> no collision
            if (point1[1] <= 5 && point2[1] <= 5) return -1
            
            // if both points are right or left of sensor -> no collision
            if ((point1[0] < 0 && point2[0] < 0) || (point1[0] > 0 && point2[0] > 0)) return -1

            const collisionDistance = point1[1] + point1[0] * ((point2[1]-point1[1]) / (-point2[0]+point1[0]))
            // if collision point is behind sensor -> no collision
            if (collisionDistance <= 5) return -1
            else return collisionDistance - 5
        }, {
            output: [2, this.trackborderMatrix.length, cars.length],
            pipeline: true
        })

        // #### Kernel: Calculates collisions of ray 2 and borders ####
        this.calcRay2Collisions = this.gpu.createKernel(function(borders, cars) {
            // if car not active, no further calculations needed
            if (cars[this.thread.z][6] === 0) return 0
            
            let point1 = [
                borders[this.thread.z][this.thread.y][2 * this.thread.x],
                borders[this.thread.z][this.thread.y][2 * this.thread.x + 1]
            ]
            let point2 = [
                borders[this.thread.z][(this.thread.y + 1) % this.output.y][2 * this.thread.x],
                borders[this.thread.z][(this.thread.y + 1) % this.output.y][2 * this.thread.x + 1]
            ]

            // if both points are behind sensor -> no collision
            if (point1[1] <= 5 && point2[1] <= 5) return -1
            
            // if both points are right or left of sensor -> no collision
            if ((point1[0] < 0 && point2[0] < 0) || (point1[0] > 0 && point2[0] > 0)) return -1

            // bug: artificially subtract 5 because ray is somehow 5 px too long
            const collisionDistance = point1[1] + point1[0] * ((point2[1]-point1[1]) / (-point2[0]+point1[0])) - 5
            
            // if collision point is behind sensor -> no collision
            if (collisionDistance <= 5) return -1
            else return collisionDistance - 5
        }, {
            output: [2, this.trackborderMatrix.length, cars.length],
            pipeline: true
        })

        // #### Kernel: Calculates collisions of ray 3 and borders ####
        this.calcRay3Collisions = this.gpu.createKernel(function(borders, cars) {
            // if car not active, no further calculations needed
            if (cars[this.thread.z][6] === 0) return 0
            
            let point1 = [
                borders[this.thread.z][this.thread.y][2 * this.thread.x],
                borders[this.thread.z][this.thread.y][2 * this.thread.x + 1]
            ]
            let point2 = [
                borders[this.thread.z][(this.thread.y + 1) % this.output.y][2 * this.thread.x],
                borders[this.thread.z][(this.thread.y + 1) % this.output.y][2 * this.thread.x + 1]
            ]

            // if both points are behind sensor -> no collision
            if (point1[0] <= 5 && point2[0] <= 5) return -1
            
            // if both points are right or left of sensor -> no collision
            if ((point1[1] < 0 && point2[1] < 0) || (point1[1] > 0 && point2[1] > 0)) return -1

            const collisionDistance = point1[0] - point1[1] * ((point2[0]-point1[0]) / (point2[1]-point1[1]))
            // if collision point is behind sensor -> no collision
            if (collisionDistance <= 5) return -1
            else return collisionDistance - 5
        }, {
            output: [2, this.trackborderMatrix.length, cars.length],
            pipeline: true
        })

        // #### Kernel: Calculates collisions of ray 4 and borders ####
        this.calcRay4Collisions = this.gpu.createKernel(function(borders, cars) {
            // if car not active, no further calculations needed
            if (cars[this.thread.z][6] === 0) return 0
            
            let point1 = [
                borders[this.thread.z][this.thread.y][2 * this.thread.x],
                borders[this.thread.z][this.thread.y][2 * this.thread.x + 1]
            ]
            let point2 = [
                borders[this.thread.z][(this.thread.y + 1) % this.output.y][2 * this.thread.x],
                borders[this.thread.z][(this.thread.y + 1) % this.output.y][2 * this.thread.x + 1]
            ]

            // if both points are behind sensor -> no collision
            if (point1[0] <= 5 && point2[0] <= 5) return -1
            
            // if both points are right or left of sensor -> no collision
            if ((point1[1] < 0 && point2[1] < 0) || (point1[1] > 0 && point2[1] > 0)) return -1

            // bug: artificially add 5 because ray is somehow 5 px too short
            const collisionDistance = point1[0] - point1[1] * ((point2[0]-point1[0]) / (point2[1]-point1[1])) + 5
            
            // if collision point is behind sensor -> no collision
            if (collisionDistance <= 5) return -1
            else return collisionDistance - 5
        }, {
            output: [2, this.trackborderMatrix.length, cars.length],
            pipeline: true
        })

        // #### Kernel: Calculates collisions of ray 5 and borders ####
        this.calcRay5Collisions = this.gpu.createKernel(function(borders, cars) {
            // if car not active, no further calculations needed
            if (cars[this.thread.z][6] === 0) return 0
            
            let point1 = [
                borders[this.thread.z][this.thread.y][2 * this.thread.x],
                borders[this.thread.z][this.thread.y][2 * this.thread.x + 1]
            ]
            let point2 = [
                borders[this.thread.z][(this.thread.y + 1) % this.output.y][2 * this.thread.x],
                borders[this.thread.z][(this.thread.y + 1) % this.output.y][2 * this.thread.x + 1]
            ]

            // if both points are behind sensor -> no collision
            if (point1[1] >= -5 && point2[1] >= -5) return -1
            
            // if both points are right or left of sensor -> no collision
            if ((point1[0] < 0 && point2[0] < 0) || (point1[0] > 0 && point2[0] > 0)) return -1

            const collisionDistance = -point1[1] - point1[0] * ((-point2[1]+point1[1]) / (point2[0]-point1[0]))
            // if collision point is behind sensor -> no collision
            if (collisionDistance <= 5) return -1
            else return collisionDistance - 5
        }, {
            output: [2, this.trackborderMatrix.length, cars.length],
            pipeline: true
        })


        // #### Kernel: Condense ray values ####
        this.condenseRayCollisions = this.gpu.createKernel(function(ray1Collisions, ray2Collisions, 
            ray3Collisions, ray4Collisions, ray5Collisions, cars) {
            // if car not active, no further calculations needed
            if (cars[this.thread.z][6] === 0) return 0
            
            let collisionCounter = 0
            let minCollisionDistance = Infinity

            for (let borderSegment = 0; borderSegment < this.constants.numberOfBorderSegments; borderSegment++) {
                for (let borderSide = 0; borderSide < 2; borderSide++) {
                    let collisionDistance = -1

                    if (this.thread.y === 0) {
                        collisionDistance = ray1Collisions[this.thread.z][borderSegment][borderSide]
                    } else if (this.thread.y === 1) {
                        collisionDistance = ray2Collisions[this.thread.z][borderSegment][borderSide]
                    } else if (this.thread.y === 2) {
                        collisionDistance = ray3Collisions[this.thread.z][borderSegment][borderSide]
                    } else if (this.thread.y === 3) {
                        collisionDistance = ray4Collisions[this.thread.z][borderSegment][borderSide]
                    } else if (this.thread.y === 4) {
                        collisionDistance = ray5Collisions[this.thread.z][borderSegment][borderSide]
                    }
                    
                    if (collisionDistance > 0) {
                        collisionCounter++
                        minCollisionDistance = Math.min(minCollisionDistance, collisionDistance)
                    }
                }
            }
            
            if (this.thread.x === 0) return collisionCounter
            else return minCollisionDistance
        }, {
            constants: {numberOfBorderSegments: this.trackborderMatrix.length},
            output: [2, 5, cars.length],
            pipeline: true
        })


        // #### Kernel: Extract Ray collision distances ####
        this.extractRayCollisionDistances = this.gpu.createKernel(function(condensedRayCollisions) {
            return condensedRayCollisions[this.thread.y][this.thread.x][1]
        }, {
            output: [5, cars.length],
            pipeline: true
        })


        // #### Kernel: Extract whether car is in track or not ####
        this.updateCarStatus = this.gpu.createKernel(function(cars, condensedRayCollisions) {
            if (this.thread.x + 1 < this.output.x) return cars[this.thread.y][this.thread.x]
            else if (cars[this.thread.y][this.thread.x] === 0) return 0
            else return condensedRayCollisions[this.thread.y][0][0] % 2
                * condensedRayCollisions[this.thread.y][1][0] % 2
                * condensedRayCollisions[this.thread.y][2][0] % 2
                * condensedRayCollisions[this.thread.y][3][0] % 2
                * condensedRayCollisions[this.thread.y][4][0] % 2
        }, {
            output: [7, cars.length],
            pipeline: true
        })


        // #### Kernel: Combine ray collision distances with car speeds as input of first ANN layer ####
        this.createANNInput = this.gpu.createKernel(function(rayCollisionDistances, cars) {
            // if car not active, no further calculations needed
            if (cars[this.thread.y][6] === 0) return 0
            
            if (this.thread.x < 5) {
                return 1 - Math.exp(-rayCollisionDistances[this.thread.y][this.thread.x] / 100)
            } else {
                return cars[this.thread.y][2] / 300
            }
        }, {
            output: [6, cars.length],
            pipeline: true
        })


        // #### Kernels: Calculate ANN layers ####
        this.calcANNLayers = []
        for (let layer = 0; layer < this.ANNConfig.length - 1; layer++) {
            this.calcANNLayers[layer] = this.gpu.createKernel(function(weights, biases, inputValues, cars) {
                // if car not active, no further calculations needed
                if (cars[this.thread.y][6] === 0) return 0
    
                let sum = 0;
    
                for (let i = 0; i < this.constants.inputSize - 1; i++) {
                    sum += inputValues[this.thread.y][i] * weights[this.thread.y][this.thread.x][i]
                }
                sum += biases[this.thread.y][this.thread.x]
    
                return Math.atan(sum)
            }, {
                constants: {
                    inputSize: this.ANNConfig[layer],
                },
                output: [this.ANNConfig[layer + 1], cars.length],
                pipeline: true
            })
        }


        // #### Kernel: Perform step on cars (position and rotation update) ####
        this.performStep = this.gpu.createKernel(function(cars, ANNResults) {
            if (this.thread.x === 0) {
                if (cars[this.thread.y][6] === 0 || cars[this.thread.y][2] < 0) return cars[this.thread.y][0]

                // if x-position -> return current x-position plus fraction of current speed in
                // x-direction times stepsize
                return cars[this.thread.y][0] + Math.cos(cars[this.thread.y][4]) * 
                    cars[this.thread.y][2] * this.constants.stepSize

            } else if (this.thread.x === 1) {
                if (cars[this.thread.y][6] === 0 || cars[this.thread.y][2] < 0) return cars[this.thread.y][1]

                // if y-position -> return current y-position plus fraction of current speed in
                // y-direction times stepsize
                return cars[this.thread.y][1] - Math.sin(cars[this.thread.y][4]) * cars[this.thread.y][2] 
                    * this.constants.stepSize

            } else if (this.thread.x === 2) {
                if (cars[this.thread.y][6] === 0 || cars[this.thread.y][2] < 0) return cars[this.thread.y][2]

                // if speed -> return current speed plus current acceleration times stepsize
                const airResistance = 0.005 * cars[this.thread.y][2]**2 * Math.sign(cars[this.thread.y][2])
                const rollingResistance = 0.25 * cars[this.thread.y][2]
                const staticResistance = 10 * Math.sign(cars[this.thread.y][2])
                const speed = cars[this.thread.y][2] + this.constants.stepSize * (cars[this.thread.y][3] 
                    - airResistance - rollingResistance - staticResistance)
                if (Math.abs(speed) < 0.2) return 0
                else return speed

            } else if (this.thread.x === 3) {
                if (cars[this.thread.y][6] === 0 || cars[this.thread.y][2] < 0) return cars[this.thread.y][3]

                // if acceleration -> return result of ANN
                return ANNResults[this.thread.y][0] * 500

            } else if (this.thread.x === 4) {
                if (cars[this.thread.y][6] === 0 || cars[this.thread.y][2] < 0) return cars[this.thread.y][4]

                // if rotation -> return current rotation plus current angular velocity times stepsize
                return cars[this.thread.y][4] + cars[this.thread.y][5] * this.constants.stepSize

            } else if (this.thread.x === 5) {
                if (cars[this.thread.y][6] === 0 || cars[this.thread.y][2] < 0) return cars[this.thread.y][5]

                // if angular velocity -> return result of ANN
                return ANNResults[this.thread.y][1] * Math.PI

            } else if (this.thread.x === 6) {
                // if active status -> check whether speed is negative
                if (cars[this.thread.y][6] === 0 || cars[this.thread.y][2] < 0) return 0
                else return 1
            }

            return 0
        }, {
            constants: {
                stepSize: 1/30,
            },
            output: [7, cars.length],
            pipeline: true
        })


        this.gpu.addFunction(function circle(point, center, radius) {
            const distanceX = point[0]-center[0]
            const distanceY = point[1]-center[1]

            // if not in bounding box -> return
            if (distanceX > radius || distanceX < -radius || distanceY > radius || distanceY < -radius) {
                return 0
            }
            
            const distance = Math.sqrt((point[0]-center[0])**2 + (point[1]-center[1])**2)
            return Math.min(Math.max(radius + 0.5 - distance, 0), 1)
        })


        // #### Kernel: Render cars ####
        this.render = this.gpu.createKernel(function(cars) {
            let r = 0
            let g = 0
            let b = 0
            let a = 0

            const car_front_r = 2/3
            const car_front_g = 0
            const car_front_b = 0
            const car_r = 0
            const car_g = 0
            const car_b = 0
            for (let i = 0; i < this.constants.numberOfCars; i++) {
                const direction = [Math.cos(cars[i][4]), -Math.sin(cars[i][4])]

                let car_a = circle(
                    [this.thread.x, 699 - this.thread.y],
                    [cars[i][0] + 5*direction[0] - 0.5, cars[i][1] + 5*direction[1] - 0.5],
                    5
                )

                if (car_a !== 0) {
                    r = (1 - car_a) * r + car_a * car_front_r
                    g = (1 - car_a) * g + car_a * car_front_g
                    b = (1 - car_a) * b + car_a * car_front_b
                    a = 1 - (1 - a) * (1 - car_a) 
                }

                car_a = circle(
                    [this.thread.x, 699 - this.thread.y],
                    [cars[i][0] - 0.5, cars[i][1] - 0.5],
                    5
                )

                if (car_a !== 0) {
                    r = (1 - car_a) * r + car_a * car_r
                    g = (1 - car_a) * g + car_a * car_g
                    b = (1 - car_a) * b + car_a * car_b
                    a = 1 - (1 - a) * (1 - car_a)
                }

                car_a = circle(
                    [this.thread.x, 699 - this.thread.y],
                    [cars[i][0] - 5*direction[0] - 0.5, cars[i][1] - 5*direction[1] - 0.5],
                    5
                )

                if (car_a !== 0) {
                    r = (1 - car_a) * r + car_a * car_r
                    g = (1 - car_a) * g + car_a * car_g
                    b = (1 - car_a) * b + car_a * car_b
                    a = 1 - (1 - a) * (1 - car_a)
                }
            }

            this.color(r, g, b, a)
        }, {
            constants: {numberOfCars: cars.length},
            output: [1000, 700],
            graphical: true,
        })


        // #### Kernel: Calculate min distance to all border segments ####
        this.calcDistancesToBorderSegments = this.gpu.createKernel(function(cars, borders) {
            const carPosition = [cars[this.thread.z][0], cars[this.thread.z][1]]
            const carDirection = [Math.cos(cars[this.thread.z][4]), -Math.sin(cars[this.thread.z][4])]
            const frontPosition = addVectors(carPosition, multiplyVector(carDirection, 5))

            const point1 = [
                borders[this.thread.y][2 * this.thread.x],
                borders[this.thread.y][2 * this.thread.x + 1]
            ]
            const point2 = [
                borders[(this.thread.y + 1) % this.output.y][2 * this.thread.x],
                borders[(this.thread.y + 1) % this.output.y][2 * this.thread.x + 1]
            ]

            const segmentVector = subtractVectors(point2, point1)
            const segmentLength = vectorLength(segmentVector)
            const segmentDirection = multiplyVector(segmentVector, 1/segmentLength)

            let projectedLength = dotVectors(subtractVectors(frontPosition, point1), segmentDirection)
            projectedLength = Math.min(Math.max(0, projectedLength), segmentLength)

            const projectedPoint = addVectors(point1, multiplyVector(segmentDirection, projectedLength))
            const projectedDistance = vectorLength(subtractVectors(projectedPoint, frontPosition))


            return projectedDistance
        }, {
            output: [2, this.trackborderMatrix.length, cars.length],
            pipeline: true,
        })


        // #### Kernel: Calculate round score #### ToDO
        this.calcRoundScores = this.gpu.createKernel(function(distancesToBorderSegment, cars, borders) {
            let minDistance = Infinity
            let minDistanceSegment = 0
            let minDistanceBorder = 0

            for (let border = 0; border < 2; border++) {
                for (let segment = 0; segment < this.constants.numOfSegments; segment++) {
                    if (distancesToBorderSegment[this.thread.x][segment][border] < minDistance) {
                        minDistance = distancesToBorderSegment[this.thread.x][segment][border]
                        minDistanceSegment = segment
                        minDistanceBorder = border
                    }
                }
            }

            const carPosition = [cars[this.thread.x][0], cars[this.thread.x][1]]
            const carDirection = [Math.cos(cars[this.thread.x][4]), -Math.sin(cars[this.thread.x][4])]
            const frontPosition = addVectors(carPosition, multiplyVector(carDirection, 5))

            const point1 = [
                borders[minDistanceSegment][2 * minDistanceBorder],
                borders[minDistanceSegment][2 * minDistanceBorder + 1]
            ]
            const point2 = [
                borders[(minDistanceSegment + 1) % this.constants.numOfSegments][2 * minDistanceBorder],
                borders[(minDistanceSegment + 1) % this.constants.numOfSegments][2 * minDistanceBorder + 1]
            ]

            const segmentVector = subtractVectors(point2, point1)
            const segmentLength = vectorLength(segmentVector)
            const segmentDirection = multiplyVector(segmentVector, 1/segmentLength)

            let projectedLength = dotVectors(subtractVectors(frontPosition, point1), segmentDirection)
            projectedLength = Math.min(Math.max(0, projectedLength), segmentLength)

            let score = minDistanceSegment + projectedLength / segmentLength
            if (score > 350) score -= 380

            return score
        }, {
            constants: {numOfSegments: this.trackborderMatrix.length},
            output: [cars.length],
            pipeline: true,
        })



        /*cars[0][0] = 0
        cars[0][1] = 50
        cars[1][0] = 50.5
        cars[1][1] = 65*/
        
        this.oldTime = Date.now()
        requestAnimationFrame(() => this.step())
            
    }

    counter = 0
    generation = 1
    fps = 30
    step() {
        if (++this.counter <= this.generation*this.fps) requestAnimationFrame(() => this.step())

        // DO NOT CHANGE ORDER OF FUNCTION CALLS:
        // Collisions of ray 1, 3 and 5 must be calculated before calling rotateBorders() again on
        // diagonal rotation matrixes because the texture of the gpu kernel is reused and therefore
        // the result of the first call of rotateBorders() overwritten.

        const translatedBorders = this.translateBorders(this.cars, this.trackborderMatrix)
        
        const rotationMatrixes = this.calcRotationMatrixes(this.cars)
        const rotatedBorders = this.rotateBorders(translatedBorders, rotationMatrixes, this.cars)
        const localTranslatedBorders = this.localTranslateBorders(rotatedBorders, this.cars)

        
        if (this.counter > this.generation*this.fps) {
            console.log(Date.now() - this.oldTime)
            this.finishGeneration()
            return
        }


        const ray1Collisions = this.calcRay1Collisions(localTranslatedBorders, this.cars)
        const ray3Collisions = this.calcRay3Collisions(localTranslatedBorders, this.cars)
        const ray5Collisions = this.calcRay5Collisions(localTranslatedBorders, this.cars)
        
        const rotationMatrixesDiagonal = this.calcRotationMatrixesDiagonal(this.cars)
        const rotatedBordersDiagonal = this.rotateBorders(translatedBorders, rotationMatrixesDiagonal, this.cars)
        const localTranslatedBordersDiagonal = this.localTranslateBorders(rotatedBordersDiagonal, this.cars)

        const ray2Collisions = this.calcRay2Collisions(localTranslatedBordersDiagonal, this.cars)
        const ray4Collisions = this.calcRay4Collisions(localTranslatedBordersDiagonal, this.cars)
        
        const condensedRayCollisions = this.condenseRayCollisions(ray1Collisions, ray2Collisions, 
            ray3Collisions, ray4Collisions, ray5Collisions, this.cars)

        const rayCollisionDistances = this.extractRayCollisionDistances(condensedRayCollisions)
        this.cars = this.updateCarStatus(this.cars, condensedRayCollisions)
        

        // ToDo: For some reason ray 2 is 5 px too long and ray 4 5 px too short
        const renderEngine = 0
        
        if (game.simulation.renderCars) {
            switch (renderEngine) {
                case 0: // Canvas
                    this.cars.toArray().slice(0, game.simulation.numberOfDisplayedCars).forEach((car, index) => {
                        game.simulation.cars[index].shape.position.x = car[0]
                        game.simulation.cars[index].shape.position.y = car[1]
                        game.simulation.cars[index].shape.rotation = car[4]
                        game.simulation.cars[index].front.fillColor = car[6] ? "green" : "#a00"
                    })
                    game.simulation.scene.render()

                    break
                case 1: // GPU
                    this.render(this.cars)

                    break
                case 2: // SVG
                    const carsAsArray = this.cars.toArray()
                    const condensedRayCollisionsAsArray = condensedRayCollisions.toArray()
                    this.svg.querySelectorAll(".car").forEach((car, carIndex) => {
                        car.setAttribute(
                            "transform", 
                            "translate(" + carsAsArray[carIndex][0] + ", " + carsAsArray[carIndex][1] + ")"
                                +" rotate(" + (-carsAsArray[carIndex][4] / Math.PI * 180) + ")"
                            )
                        /*car.querySelectorAll(".ray").forEach((ray, rayIndex) => {
                            ray.setAttribute("x2", condensedRayCollisionsAsArray[carIndex][rayIndex][1] + 5)
                        })*/
                    })

                    break
            }
        }


        let ANNResult = this.createANNInput(rayCollisionDistances, this.cars)
        this.calcANNLayers.forEach((calcANNLayer, index) => {
            ANNResult = calcANNLayer(this.weights[index], this.biases[index], ANNResult, this.cars)
        })

        this.cars = this.performStep(this.cars, ANNResult)
    }

    finishGeneration() {
        this.counter = 0
        this.generation++
        game.simulation.generation = this.generation

        const distancesToBorderSegments = this.calcDistancesToBorderSegments(this.cars, 
            this.trackborderMatrix)
        const roundScores = this.calcRoundScores(distancesToBorderSegments, this.cars, 
            this.trackborderMatrix).toArray()
        
        this.cars = this.cars.toArray()

        const carsInfo = []
        this.cars.forEach((car, carIndex) => {
            const carInfo = {
                score: roundScores[carIndex],
                weights: [],
                biases: []
            }
            this.weights.forEach((weights, layerIndex) => {
                carInfo.weights.push(weights[carIndex])
                carInfo.biases.push(this.biases[layerIndex][carIndex])
            })
            carsInfo.push(carInfo)
        })

        carsInfo.sort((carA, carB) => carB.score - carA.score)


        const mutationRates = [0.1, 0.02]
        const numberOfPreservedCars = Math.floor(carsInfo.length / (mutationRates.length + 1))

        game.simulation.highscores.push(carsInfo[0].score)
        game.simulation.averages.push(carsInfo.reduce((score, car) => score + car.score, 0) / carsInfo.length)
        game.simulation.averagesTops.push(carsInfo.slice(0, numberOfPreservedCars).reduce((score, car) => 
            score + car.score, 0) / Math.floor(this.cars.length/3))

        game.simulation.drawScoreShart()
        //game.simulation.drawAnnChart()


        carsInfo.splice(numberOfPreservedCars)

        carsInfo.forEach(carInfo => {
            mutationRates.forEach(mutationRate => {
                const clone = JSON.parse(JSON.stringify(carInfo))
                
                clone.weights.forEach((layerWeights, layerIndex) => {
                    layerWeights.forEach((neuronWeights, neuronIndex) => {
                        clone.biases[layerIndex][neuronIndex] += 2 * mutationRate * Math.random() - mutationRate

                        neuronWeights.forEach((inputWeight, inputIndex) => {
                            neuronWeights[inputIndex] += mutationRate * Math.random() - mutationRate
                        })
                    })
                })

                carsInfo.push(clone)
            })
        })

        for (let layer = 0; layer < this.ANNConfig.length-1; layer++) {
            this.weights[layer] = []
            this.biases[layer] = []
            
            carsInfo.forEach(carInfo => {
                this.weights[layer].push(carInfo.weights[layer])
                this.biases[layer].push(carInfo.biases[layer])
            })
        }


        this.cars = JSON.parse(JSON.stringify(this.originalCars))
        this.oldTime = Date.now()
        console.log("Start generation", this.generation)
        requestAnimationFrame(() => this.step())
    }
}

export {GPUController}