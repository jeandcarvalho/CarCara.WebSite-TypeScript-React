export default function formatDuration(totalSeconds: number): string {
  { 
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
    
        
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
       
      
        return `${formattedHours}h ${formattedMinutes}m`;
  }
}



