import React, { useState } from 'react';
import { Form } from '@remix-run/react';
import type { FC } from 'react';

interface FormState {
  color: string;
  textColor: string;
  text: string;
  format: "png" | "jpeg" | "webp";
}

const OverlayPage: FC = () => {
  const [formState, setFormState] = useState<FormState>({
    color: '#000000',
    textColor: '#000000',
    text: 'Overlay Text',
    format: 'png'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Image Overlay Generator</h1>
      
      <Form method="get" action="/api/overlay" className="space-y-4">
        <div>
          <label htmlFor="color" className="block mb-2">Overlay Color</label>
          <input
            type="color"
            id="color"
            name="color"
            value={formState.color}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="text" className="block mb-2">Overlay Text</label>
          <input
            type="text"
            id="text"
            name="text"
            value={formState.text}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="textColor" className="block mb-2">Text Color</label>
          <input
            type="color"
            id="textColor"
            name="textColor"
            value={formState.textColor}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="format" className="block mb-2">Output Format</label>
          <select
            id="format"
            name="format"
            value={formState.format}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
          Generate Image
        </button>
      </Form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Preview</h2>
        <div className="border-2 border-dashed p-4 rounded">
          <img
            src={`/api/overlay?color=${encodeURIComponent(formState.color)}&text=${encodeURIComponent(formState.text)}&textColor=${encodeURIComponent(formState.textColor)}&format=${formState.format}`}
            alt="Preview"
            className="max-w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default OverlayPage;