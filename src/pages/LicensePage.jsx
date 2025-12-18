import React from 'react';
import { useNavigate } from 'react-router-dom';

const LicensePage = () => {
  const navigate = useNavigate();

  const licenseText = `
MIT License

Copyright (c) 2025 Irona

Permission is hereby granted, free of charge, to any person obtaining a copy  
of this software and associated documentation files (the "Software"), to deal  
in the Software without restriction, including without limitation the rights  
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
copies of the Software, and to permit persons to whom the Software is  
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in  
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  
SOFTWARE.
  `;

  const usedPackages = [
    'react',
    'react-dom',
    'react-router-dom',
    'react-scripts',
    'react-icons',
    'react-circular-slider-svg',
    'lucide-react',
    'web-vitals',
    '@testing-library/react',
    '@testing-library/dom',
    '@testing-library/jest-dom',
    '@testing-library/user-event',
  ];

  return (
    <div className="p-6">
      <button
        className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        onClick={() => navigate(-1)}
      >
        ← 뒤로가기
      </button>

      <h1 className="text-2xl font-bold mb-4">라이선스 정보</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">사용한 라이선스</h2>
        <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded text-sm">
          {licenseText}
        </pre>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">사용된 주요 오픈소스 라이브러리</h2>
        <ul className="list-disc list-inside text-sm bg-gray-50 p-4 rounded">
          {usedPackages.map((pkg, index) => (
            <li key={index}>{pkg}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default LicensePage;
