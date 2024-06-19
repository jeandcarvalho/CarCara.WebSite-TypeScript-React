import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapComponentAll";
import api from '../Services/api';
import yellowicon from "../Components/img/mapicon.png";

const MapCity = ({ cidadeSelecionada }) => {
    const mapRef = useRef(null);
  
    useEffect(() => {
        const defaultPosition = [-21.0505, -44.6333]; // Posição padrão do mapa
        if (!mapRef.current) {
            mapRef.current = L.map("map", {
                center: defaultPosition,
                zoom: 3,
                minZoom: 3,
                maxZoom: 14,
                doubleClickZoom: false,
                boxZoom: false,
                keyboard: false,
                tap: false,
                scrollWheelZoom: false,
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
                let hasCityPoint = false; // Flag para verificar se a cidade tem pontos
                points.forEach((point) => {
                    if (point.Cidade === cidadeSelecionada) {
                        hasCityPoint = true;
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
                if (hasCityPoint) {
                    // Se houver pontos na cidade, centralize o mapa na primeira coordenada encontrada
                    const cityPoint = points.find(point => point.Cidade === cidadeSelecionada);
                    mapRef.current.setView([cityPoint.Gps_Y, cityPoint.Gps_X], 10);
                } else {
                    // Se não houver pontos na cidade, mantenha a posição padrão do mapa
                    mapRef.current.setView(defaultPosition, 8);
                }
            } catch (error) {
                console.error("Erro ao carregar pontos do MongoDB:", error);
            }
        };
        loadPoints();
        [cidadeSelecionada, defaultPosition]
    }, );
    return (
        <div id="map" className="custom-map"></div>
    );
};

export default MapCity;
