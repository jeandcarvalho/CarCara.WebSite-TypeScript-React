// src/components/DownloadButtons.tsx
import React from 'react';

interface DownloadButtonProps {
    fileId: string | null;
    fileName: string;
    onClick: (fileId: string, fileName: string) => void;
    title: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ fileId, fileName, onClick, title }) => {
    const handleClick = () => {
        if (fileId) {
            onClick(fileId, fileName);
        } else {
            console.error("File ID is null");
        }
    };

    return (
        <button className="bg-yellow-500 hover:scale-105 duration-200 text-black rounded relative w-full text-center justify-center" onClick={handleClick} title={title}>
            {title}
        </button>
    );
};

export const downloadVideo = (fileId: string, fileName: string) => {
    if (!fileId || !fileName) {
        console.error("Invalid file ID or file name");
        return;
    }
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export default DownloadButton;
