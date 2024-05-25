import React, {useState, ChangeEvent} from 'react'
import axios from 'axios'

interface PdfFile {
    onUpload: (documentId:string) => void;
}

const FileUpload: React.FC<PdfFile> = ({onUpload}) => {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    const handleFileUpload = async () => {
        if (!file) return;
    
        const formData = new FormData();
        formData.append('file', file)
        try{
            const response = await axios.post('http://localhost:3001/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onUpload(response.data.documentId);
            console.log(response.data.documentId);
        } catch (error){
            console.error('Error during upload', error);
        }
    }

    return (
        <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Ladda upp</button>
    </div>
    );

};

export default FileUpload;