import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapComponentAll.css";
import api from '../Services/api';
import yellowicon from "../Components/img/mapicon.png"


const MapComponentAll = () => {
    const mapRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map("map", {
                center: [-21.0505, -44.6333],
                zoom: 6,
                minZoom: 3,
                maxZoom: 13,
                doubleClickZoom: false,
                boxZoom: false,
                keyboard: false,
                tap: false,
            });

            L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png", {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
            }).addTo(mapRef.current);
        }

        const loadPoints = async () => {
            try {
                const response = await api.get("/videofiles");
                const points = response.data;

                points.forEach((point, index) => {
                    if (index % 1 === 0) { // Verifica se o índice é múltiplo de 5
                        const { Gps_Y, Gps_X } = point;
                        
                        L.marker([Gps_Y, Gps_X], {
                            icon: L.icon({
                                iconUrl: yellowicon,
                                iconSize: [32, 30], // Tamanho padrão do ícone do marcador
                                iconAnchor: [16, 50], // Ponto de ancoragem do ícone do marcador
                              
                            })
                        }).addTo(mapRef.current);
                        
                    }
                });
                
            } catch (error) {
                console.error("Erro ao carregar pontos do MongoDB:", error);
            }
        };

        loadPoints();

    }, []);

    return (
        <div id="map" className="custom-map"></div>
    );
};

export default MapComponentAll;
