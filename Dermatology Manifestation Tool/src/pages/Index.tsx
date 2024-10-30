import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { LoadingState } from "@/components/LoadingState";
import { analyzeImage, type AnalysisResult } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleImageSelected = async (file: File) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const analysisResult = await analyzeImage(file);
      setResult(analysisResult);
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "There was an error analyzing your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-medical-light to-white">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Tool For Dermatology Manifestation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload or capture an image of your skin concern, and our AI-powered
            system will help identify potential conditions.
          </p>
        </header>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <ImageUpload onImageSelected={handleImageSelected} />
          </div>

          {isAnalyzing && (
            <LoadingState message="Analyzing your image... Please wait." />
          )}

          {result && <ResultsDisplay result={result} />}

          {/* <div className="text-center text-sm text-gray-500">
            Your privacy is important to us. All images are processed securely and
            not stored on our servers.
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Index;