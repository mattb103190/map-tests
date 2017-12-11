import { Component, OnInit, OnDestroy, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { BaseMapComponent } from '../base-map/base-map.component';

import * as L from 'leaflet';
import 'leaflet-draw';
import { FeatureGroup, DivIcon, Point } from 'leaflet';

@Component({
    selector: 'mtx-drawing-map',
    template: '<div class="map"></div>',
    styles: [
        `:host >>> .leaflet-popup-content-wrapper, :host >>> .leaflet-popup-content {
            border-radius: 0 !important;
        }`
    ]
})
export class DrawingMapComponent extends BaseMapComponent implements OnInit, OnDestroy, OnChanges {

    @Input() public includeCircle = true;
    @Input() public shapeColor = '#fff';
    @Output() public shapeComplete = new EventEmitter();
    @Output() public receiveNativeShapeLayer = new EventEmitter();

    drawingGroup: L.FeatureGroup;
    drawingControl: L.Control;
    shape: any;
    formattedShape: any;

    ngOnInit() {
        this.getNativeInstance().then(() => this.createDrawingLayers());
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
    }

    ngOnDestroy() {
        if (this.drawingControl) {
            this.drawingControl.remove();
            this.drawingControl = null;
        }
        if (this.drawingGroup) {
            this.drawingGroup.remove();
            this.drawingGroup = null;
        }

    }


    createDrawingLayers() {
        if (!this.mapInstance) {
            return;
        }

        this.drawingGroup = new FeatureGroup([]).addTo(this.mapInstance);

        const drawControlOpts: L.Control.DrawConstructorOptions = {
            position: 'topleft',
            draw: <any>{
                polyline: false,
                polygon: {
                    icon: new DivIcon({
                        iconSize: new Point(12, 12),
                        className: 'leaflet-div-icon leaflet-editing-icon'
                    }),
                    shapeOptions: {
                        color: '#00bf00'
                    }
                },
                circle: {
                    shapeOptions: {
                        color: '#00bf00'
                    }
                },
                rectangle: false,
                marker: false,
                circlemarker: false
            },
            edit: {
                featureGroup: this.drawingGroup,
                remove: true
            }
        };

        if (!this.includeCircle) {
            drawControlOpts.draw.circle = null;
        }

        this.drawingControl = new L.Control.Draw(drawControlOpts).addTo(this.mapInstance);

        (<any>L).Edit.Poly = (<any>L).Edit.Poly.extend({
            options: {
                icon: new L.DivIcon({
                    iconSize: new L.Point(7, 7),
                    className: 'leaflet-div-icon leaflet-editing-icon'
                })
            }
        });

        this.mapInstance.on('draw:drawstart', (e) => {
            if (this.shapeColor) {
                if (this.includeCircle) {
                    (<any>drawControlOpts.draw.circle).shapeOptions.color = this.shapeColor;
                }

                (<any>drawControlOpts.draw.polygon).shapeOptions.color = this.shapeColor;
            }

            this.drawingGroup.removeLayer(this.shape);
        });

        this.mapInstance.on(L.Draw.Event.CREATED, (e) => {
            this.shape = e['layer'];
            this.drawingGroup.addLayer(this.shape);

            if (this.shape._mRadius) {
                this.formattedShape = {
                    type: 'Point',
                    coordinates: [this.shape._latlng.lng, this.shape._latlng.lat],
                    radius: this.shape._mRadius
                };
            } else {
                const polyCoords = [];

                for (let i = 0; i < this.shape._latlngs[0].length; i++) {
                    polyCoords.push([this.shape._latlngs[0][i].lng, this.shape._latlngs[0][i].lat]);
                }

                polyCoords.push([this.shape._latlngs[0][0].lng, this.shape._latlngs[0][0].lat]);


                this.formattedShape = {
                    type: 'Polygon',
                    coordinates: [polyCoords]
                };
            }

            this.shapeComplete.emit(this.formattedShape);
            this.receiveNativeShapeLayer.emit(this.shape);
        });

        this.mapInstance.on(L.Draw.Event.EDITED, (e) => {
            if (!e) {
                return;
            }

            const layers = e['layers'];
            layers.eachLayer(layer => {
                this.shape = layer;
                this.drawingGroup.addLayer(this.shape);

                if (this.shape._mRadius) {
                    this.formattedShape = {
                        type: 'Point',
                        coordinates: [this.shape._latlng.lng, this.shape._latlng.lat],
                        radius: this.shape._mRadius
                    };
                } else {
                    const polyCoords = [];

                    for (let i = 0; i < this.shape._latlngs[0].length; i++) {
                        polyCoords.push([this.shape._latlngs[0][i].lng, this.shape._latlngs[0][i].lat]);
                    }

                    polyCoords.push([this.shape._latlngs[0][0].lng, this.shape._latlngs[0][0].lat]);


                    this.formattedShape = {
                        type: 'Polygon',
                        coordinates: [polyCoords]
                    };
                }

                this.shapeComplete.emit(this.formattedShape);
                this.receiveNativeShapeLayer.emit(this.shape);
            });
        });

        this.mapInstance.on(L.Draw.Event.DELETED, e => {
            this.shapeComplete.emit(undefined);
            this.receiveNativeShapeLayer.emit(undefined);
        });
    }


    getDrawingGroup() {
        return this.drawingGroup;
    }
}
