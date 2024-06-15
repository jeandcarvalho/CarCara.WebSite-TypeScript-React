import React from "react";
interface FilesProps {
    Gps_y: number;
    (Gps_X ): number;
    Gps_Z: number;
    Bairro :string;
    Cidade :string;
    Estado :string;
}
interface MapComponentProps {
    states?: LatLngLiteral[];
}
declare const MapComponentAll: React.FC<MapComponentAllProps>;

export default MapComponentAll;
