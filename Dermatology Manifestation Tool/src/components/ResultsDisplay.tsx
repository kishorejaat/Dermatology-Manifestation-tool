import { AnalysisResult } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const ResultsDisplay = ({ result }: { result: AnalysisResult }) => {
  const confidencePercentage = Math.round(result.confidence * 100);
  const isHighConfidence = result.confidence > 0.7;

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Analysis Results</h2>
        {isHighConfidence ? (
          <CheckCircle2 className="h-6 w-6 text-success-dark" />
        ) : (
          <AlertCircle className="h-6 w-6 text-yellow-500" />
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-700">Detected Condition</h3>
          <p className="text-xl font-semibold text-medical-dark">
            {result.condition}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-700">Confidence Level</h3>
          <div className="mt-2 relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-medical-dark bg-medical-light">
                  {confidencePercentage}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 text-xs flex rounded bg-medical-light">
              <div
                style={{ width: `${confidencePercentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-medical-dark"
              ></div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-700">Description</h3>
          <p className="text-gray-600 mt-1">{result.description}</p>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-700">Recommendations</h3>
          <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
            {result.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        Note: This analysis is for informational purposes only. Please consult a healthcare professional for proper medical advice.
      </div>
    </Card>
  );
};