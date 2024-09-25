import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapComponentAll";
import api from '../Services/api';
import yellowicon from "../Components/img/mapicon.png";

// Coordenadas dos estados selecionados
const stateCoordinates = {
    "São Paulo": [-23.3505, -47.4333],
    "Espírito Santo": [-19.9834, -40.3089],
    "Minas Gerais": [-19.3122, -42.555],
    "Rio de Janeiro": [-20.9068, -42.1729],
    "Paraná": [-24.3521, -50.0215],
};

const MapState = ({ estadoSelecionado }) => {
    const mapRef = useRef(null);
    useEffect(() => {
        if (!mapRef.current) {
            const defaultPosition = [-21.0505, -44.6333]; // Posição padrão do mapa
            const center = stateCoordinates[estadoSelecionado] || defaultPosition;
            mapRef.current = L.map("map", {
                center: center,
                zoom: 8,
                minZoom: 3,
                maxZoom: 13,
                doubleClickZoom: false,
                boxZoom: false,
                scrollWheelZoom: false,
                keyboard: false,
                tap: false,
            });
            L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png", {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
            }).addTo(mapRef.current);
        }
        mapRef.current.scrollWheelZoom.disable(); // Desativar zoom com a roda do mouse
        //   mapRef.current.dragging.disable(); // Desativar arrastar o mapa com o mouse
      //     mapRef.current.touchZoom.disable(); // Desativar zoom com gestos de toque
           mapRef.current.doubleClickZoom.disable();
        const loadPoints = async () => {
            try {
                const response = await api.get("/videofiles");
                const points = response.data;
                points.forEach((point, index) => {
                    if (index % 1 === 0 && point.Estado === estadoSelecionado) {
                        const { Gps_Y, Gps_X } = point;
                        L.marker([Gps_Y, Gps_X], {
                            icon: L.icon({
                                iconUrl: yellowicon,
                                iconSize: [32, 30],
                                iconAnchor: [16, 50],
                            })
                        }).addTo(mapRef.current);
                    }
                });         
            } catch (error) {
                console.error("Erro ao carregar pontos do MongoDB:", error);
            }
        };
        loadPoints();
    }, [estadoSelecionado]);
    return (
        <div id="map" className="custom-map"></div>
    );
};

export default MapState;
