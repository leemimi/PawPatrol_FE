import React, { useState, useEffect } from 'react';

const Protection = () => {
  const [animals, setAnimals] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getStatusText = (status) => {
    switch (status) {
      case 'PROTECTION_POSSIBLE':
        return '임보가능';
      case 'PROTECTION_IMPOSSIBLE':
        return '임보불가';
      case 'PROTECTION_COMPLETE':
        return '임보완료';
      default:
        return status;
    }
  };

  const fetchAnimals = async () => {
    console.log('Attempting to fetch animals...');
    setLoading(true);
    setError(null);

    try {
      const apiUrl = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/protections?page=${page}&size=10`;
      console.log('API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // 원시 응답 확인
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // 유효한 JSON인지 확인
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('응답이 유효한 JSON이 아닙니다:', e);
        setError('서버에서 잘못된 응답 형식을 반환했습니다');
        return;
      }

      console.log('Parsed data:', data);

      if (data.resultCode === "200") {
        setAnimals(data.data.content);
      } else {
        setError(`API 오류: ${data.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Error in fetchAnimals:', error);
      setError('데이터를 가져오는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, [page]);

  return (
    <div className="max-w-lg mx-auto bg-orange-50/30 min-h-screen p-3">
      <div className="flex flex-col gap-3">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>오류:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">로딩중...</div>
        ) : animals.length > 0 ? (
          animals.map((animal, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-orange-100">
              <div className="relative">
                {animal.imageUrl && (
                  <img
                    src={animal.imageUrl}
                    alt={animal.animalName}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${animal.caseStatus === 'PROTECTION_POSSIBLE'
                      ? 'bg-red-400 text-white'
                      : 'bg-orange-300 text-white'
                    }`}>
                    {getStatusText(animal.caseStatus)}
                  </span>
                </div>
              </div>

              <div className="p-3.5">
                <h3 className="text-sm font-medium text-gray-900 mb-1.5">
                  {animal.animalName}
                </h3>
                <div className="mt-2 text-xs text-gray-500">
                  등록일: {new Date(animal.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">
                  수정일: {new Date(animal.modifiedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">보호 가능한 동물이 없습니다.</div>
        )}
      </div>

      {!loading && animals.length > 0 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 bg-orange-100 disabled:bg-gray-100 rounded"
          >
            이전
          </button>
          <span className="px-3 py-1">{page + 1} 페이지</span>
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 bg-orange-100 rounded"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default Protection;