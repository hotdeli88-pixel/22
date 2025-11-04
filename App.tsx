import React, { useState, useCallback, useRef } from 'react';
import { generateImage } from './services/geminiService';

const initialPrompt = "사진 속 캐릭터들의 1/7 스케일 상업용 피규어를 현실적인 스타일로, 실제 환경에 배치해 줘. 피규어는 컴퓨터 책상 위에 놓여 있고, 피규어 받침대는 둥근 투명 아크릴로, 받침대에는 아무런 글씨도 없어. 컴퓨터 화면에는 이 피규어의 Zbrush 모델링 과정이 보여. 컴퓨터 화면 옆에는 오리지널 아트워크가 인쇄된 BANDAI 스타일의 장난감 포장 상자가 있어. 포장에는 2D 평면 일러스트레이션이 들어가 있어.";

const UploadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
);

const ImageIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

const SparklesIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.553L16.5 21.75l-.398-1.197a3.375 3.375 0 00-2.456-2.456L12.5 18l1.197-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.197a3.375 3.375 0 002.456 2.456L20.5 18l-1.197.398a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);

const Spinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const App: React.FC = () => {
    const [sourceImage, setSourceImage] = useState<File | null>(null);
    const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if(sourceImageUrl) URL.revokeObjectURL(sourceImageUrl);
            setSourceImage(file);
            setSourceImageUrl(URL.createObjectURL(file));
            setGeneratedImage(null);
            setError(null);
        }
    };

    const handleGenerate = useCallback(async () => {
        if (!sourceImage) {
            setError("Please upload an image.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        try {
            const result = await generateImage(sourceImage, initialPrompt);
            setGeneratedImage(result);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [sourceImage]);
    
    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">나만의 피규어 생성기</h1>
                    <p className="text-slate-400 mt-2 text-lg">Create your own photorealistic figurine.</p>
                </header>
                
                <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Input Column */}
                    <div className="flex flex-col gap-6">
                        {/* Image Upload */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 backdrop-blur-sm">
                            <label className="block text-lg font-semibold mb-3 text-cyan-300">Upload Image</label>
                            <div 
                                className="relative border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-cyan-400 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/webp"
                                />
                                {sourceImageUrl ? (
                                    <img src={sourceImageUrl} alt="Uploaded preview" className="mx-auto max-h-80 rounded-md object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-slate-400 h-80">
                                        <UploadIcon className="h-12 w-12 mb-2" />
                                        <span className="font-semibold">Click to upload</span>
                                        <span className="text-sm">PNG, JPG, or WEBP</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Output Column */}
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 flex flex-col backdrop-blur-sm">
                        <h2 className="text-lg font-semibold mb-3 text-purple-300">Generated Result</h2>
                        <div className="flex-grow bg-slate-900/70 rounded-lg flex items-center justify-center relative overflow-hidden aspect-square">
                            {isLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10">
                                    <Spinner />
                                    <p className="mt-4 text-slate-300">Generating your figure...</p>
                                </div>
                            )}
                            {error && (
                                <div className="p-4 text-center text-red-400">
                                    <p className="font-semibold">Generation Failed</p>
                                    <p className="text-sm mt-1">{error}</p>
                                </div>
                            )}
                            {!isLoading && !error && generatedImage && (
                                <img src={generatedImage} alt="Generated figure" className="w-full h-full object-contain" />
                            )}
                            {!isLoading && !error && !generatedImage && (
                                <div className="text-center text-slate-500 p-4">
                                    <ImageIcon className="h-16 w-16 mx-auto mb-2"/>
                                    <p>Your generated figure will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
                
                <div className="flex justify-center mt-8">
                     <button
                            onClick={handleGenerate}
                            disabled={isLoading || !sourceImage}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            {isLoading ? <Spinner /> : <SparklesIcon className="h-6 w-6" />}
                            <span>{isLoading ? 'Generating...' : 'Generate Figure'}</span>
                        </button>
                </div>
            </div>
        </div>
    );
};

export default App;
