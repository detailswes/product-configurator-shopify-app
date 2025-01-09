// app/routes/upload.tsx
import { Form, useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { useState, useRef } from "react";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

// Types for our response data
type ActionData = {
  success?: boolean;
  error?: string;
  filename?: string;
  url?: string;
};

// Re-export the action from the API route
export const action: ActionFunction = async ({ request }) => {
  const response = await fetch("/api/upload", {
    method: "POST",
    body: await request.formData(),
  });
  return json(await response.json());
};

export default function UploadPage() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isUploading = navigation.state === "submitting";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    submit(formData, { method: "post", action: "/upload" });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const resetForm = () => {
    formRef.current?.reset();
    setSelectedFile(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload a File</h1>

      {/* Success Message */}
      {actionData?.success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          <p>File uploaded successfully!</p>
          {actionData.url && (
            <a 
              href={actionData.url} 
              className="text-green-600 hover:text-green-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View uploaded file
            </a>
          )}
          <button
            onClick={resetForm}
            className="ml-4 text-sm text-green-600 hover:text-green-800 underline"
          >
            Upload another file
          </button>
        </div>
      )}

      {/* Error Message */}
      {actionData?.error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {actionData.error}
        </div>
      )}

      <Form 
        ref={formRef}
        method="post" 
        encType="multipart/form-data"
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose a file
          </label>
          <input 
            type="file" 
            name="file" 
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2"
            disabled={isUploading}
            required
          />
        </div>

        {selectedFile && (
          <div className="text-sm text-gray-600">
            Selected file: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
          </div>
        )}

        <button 
          disabled={isUploading || !selectedFile}
          className={`px-4 py-2 rounded transition ${
            isUploading || !selectedFile
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </Form>
    </div>
  );
}