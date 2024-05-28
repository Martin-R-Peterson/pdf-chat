import React, {useState, ChangeEvent} from 'react'
import axios from 'axios'

interface PdfFile {
    onUpload: (documentId:string) => void;
}

const FileUpload: React.FC<PdfFile> = ({onUpload}) => {
    const [file, setFile] = useState<File | null>(null);
    const [selectedFile,setSelectedFile] = useState("Please upload a pdf");

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
    <div className="flex flex-col items-center space-y-4">
            <div className="relative">
                <span className="px-2 py-2 text-gray-400">{file?.name ?? "Please upload a pdf"}</span>
                <input
                    id="fileInput"
                    className="hidden"
                    type="file"
                    onChange={handleFileChange}
                />
                <label
                    htmlFor="fileInput"
                    className="flex items-center bg-gray-500 text-white my-2 mx-2 px-2 py-2 rounded-md cursor-pointer hover:bg-blue-600 transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="size-6 mx-2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                        />
                    </svg>
                    <span className='px-2'>Upload</span>
                </label>
            </div>
            <button
                onClick={handleFileUpload}
                className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
                Upload PDF
            </button>
        </div>
        
      
    );

};

export default FileUpload;