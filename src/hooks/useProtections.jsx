import { useState, useEffect, useCallback } from 'react';
import { ProtectionApiService } from '../api/ProtectionApiService';

// 보호 동물 목록 조회 훅
export const useProtections = (initialPage = 0, initialSize = 10, animalType = null, location = null) => {
    // 누적 컨텐츠 배열 추가
    const [accumulatedContent, setAccumulatedContent] = useState([]);
    const [data, setData] = useState({ content: [], totalElements: 0, last: true });
    const [page, setPage] = useState(initialPage);
    const [size, setSize] = useState(initialSize);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentAnimalType, setCurrentAnimalType] = useState(animalType);
    const [currentLocation, setCurrentLocation] = useState(location);

    useEffect(() => {
        setCurrentAnimalType(animalType);
        setCurrentLocation(location);
    }, [animalType, location]);

    const fetchProtections = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await ProtectionApiService.fetchProtections(
                page, size, currentAnimalType, currentLocation
            );

            // 원본 데이터 저장
            setData(result);

            // 누적 컨텐츠 업데이트
            if (page === 0) {
                // 첫 페이지면 데이터 초기화
                setAccumulatedContent(result.content);
            } else {
                // 아니면 기존 데이터에 추가
                setAccumulatedContent(prev => {
                    // 중복 ID 제거 로직
                    const existingIds = new Set(prev.map(item => item.animalCaseId));
                    const uniqueNewContent = result.content.filter(
                        item => !existingIds.has(item.animalCaseId)
                    );
                    return [...prev, ...uniqueNewContent];
                });
            }
        } catch (err) {
            setError(err);
            console.error('보호 동물 목록 조회 중 오류 발생:', err);
        } finally {
            setLoading(false);
        }
    }, [page, size, currentAnimalType, currentLocation]);

    useEffect(() => {
        fetchProtections();
    }, [fetchProtections]);

    const nextPage = () => {
        if (!data.last) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const prevPage = () => {
        if (page > 0) {
            setPage(prevPage => prevPage - 1);
        }
    };

    const resetPage = () => {
        setPage(0);
        setAccumulatedContent([]);
    };

    const changeSize = (newSize) => {
        setSize(newSize);
        setPage(0);
        setAccumulatedContent([]);
    };

    return {
        // 원본 데이터와 누적 데이터 모두 제공
        data: {
            ...data,
            // content 대신 누적된 컨텐츠 제공
            content: accumulatedContent
        },
        loading,
        error,
        page,
        size,
        nextPage,
        prevPage,
        resetPage,
        changeSize,
        refresh: () => {
            fetchProtections();
        }
    };
};

// 보호 동물 상세 조회 훅
export const useProtectionDetail = (id) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDetail = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);
            const result = await ProtectionApiService.fetchProtectionDetail(id);
            setData(result);
        } catch (err) {
            setError(err);
            console.error('보호 동물 상세 조회 중 오류 발생:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    return {
        data,
        loading,
        error,
        refresh: fetchDetail
    };
};

// 나의 등록 동물 목록 훅
export const useMyRegisteredAnimals = (initialPage = 0, initialSize = 10) => {
    const [accumulatedContent, setAccumulatedContent] = useState([]);
    const [data, setData] = useState({
        page: { content: [], totalElements: 0, last: true },
        memberRole: 'ROLE_USER',
        waitingCount: 0,
        protectingCount: 0,
        shelterCount: 0
    });
    const [page, setPage] = useState(initialPage);
    const [size, setSize] = useState(initialSize);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMyAnimals = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await ProtectionApiService.fetchMyRegisteredAnimals(page, size);

            // 원본 데이터 저장
            setData(result);

            console.log(data);

            // 누적 컨텐츠 업데이트 
            if (page === 0) {
                setAccumulatedContent(result.page.content);
            } else {
                setAccumulatedContent(prev => {
                    const existingIds = new Set(prev.map(item => item.animalCaseId));
                    const uniqueNewContent = result.page.content.filter(
                        item => !existingIds.has(item.animalCaseId)
                    );
                    return [...prev, ...uniqueNewContent];
                });
            }
        } catch (err) {
            setError(err);
            console.error('내 등록 동물 목록 조회 중 오류 발생:', err);
        } finally {
            setLoading(false);
        }
    }, [page, size]);

    useEffect(() => {
        fetchMyAnimals();
    }, [fetchMyAnimals]);

    const nextPage = () => {
        if (!data.page.last) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const prevPage = () => {
        if (page > 0) {
            setPage(prevPage => prevPage - 1);
        }
    };

    const resetPage = () => {
        setPage(0);
        setAccumulatedContent([]);
    };

    return {
        data: {
            // 원래 반환하던 형식 유지하되 내부 구조 변경
            content: accumulatedContent,
            totalElements: data.page.totalElements,
            last: data.page.last,
            // 새로운 속성 추가
            waitingCount: data.waitingCount,
            protectingCount: data.protectingCount,
            shelterCount: data.shelterCount,
            memberRole: data.memberRole
        },
        loading,
        error,
        page,
        size,
        nextPage,
        prevPage,
        resetPage,
        refresh: () => {
            resetPage();
            fetchMyAnimals();
        }
    };
};

// 보호 동물 등록/수정 훅
export const useAnimalForm = (id = null) => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [initialData, setInitialData] = useState(null);

    // 수정 모드일 경우 초기 데이터 로드
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const result = await ProtectionApiService.fetchProtectionDetail(id);
                console.log('API 응답 원본 데이터:', result);

                // API 응답에서 폼 데이터로 변환
                const animalData = result.animalCaseDetail;
                const formData = {
                    title: animalData.title || "",
                    description: animalData.description || "",
                    location: animalData.location || "",
                    breed: animalData.animalInfo.breed || "",
                    gender: animalData.animalInfo.gender === 'M' ? 'MALE' : animalData.animalInfo.gender === 'F' ? 'FEMALE' : 'UNKNOWN',
                    size: animalData.animalInfo.size || "MEDIUM",
                    feature: animalData.animalInfo.feature || "",
                    healthCondition: animalData.animalInfo.healthCondition || "",
                    name: animalData.animalInfo.name || "",
                    estimatedAge: animalData.animalInfo.age || "",
                    registrationNo: animalData.animalInfo.registrationNo || "",
                    animalType: animalData.animalInfo.animalType || "DOG"
                };
                const imagePaths = result.images ? result.images.map(img => img.path) : [];

                setInitialData({
                    formData,
                    imageUrl: animalData.animalInfo.imageUrl,
                    imageUrls: imagePaths
                });
            } catch (err) {
                setError(err);
                console.error('데이터 로드 중 오류 발생:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id]);

    // 동물 등록 함수
    const registerAnimal = async (formData) => {
        try {
            setSubmitting(true);
            setError(null);
            const result = await ProtectionApiService.registerAnimal(formData);
            return result;
        } catch (err) {
            setError(err);
            console.error('동물 등록 중 오류 발생:', err);
            throw err;
        } finally {
            setSubmitting(false);
        }
    };

    // 동물 정보 수정 함수
    const updateAnimal = async (animalId, formData) => {
        try {
            setSubmitting(true);
            setError(null);
            const result = await ProtectionApiService.updateAnimal(animalId, formData);
            return result;
        } catch (err) {
            setError(err);
            console.error('동물 정보 수정 중 오류 발생:', err);
            throw err;
        } finally {
            setSubmitting(false);
        }
    };

    return {
        loading,
        submitting,
        error,
        initialData,
        registerAnimal,
        updateAnimal
    };
};

// 보호/입양 신청 관련 훅
export const useProtectionApplication = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 보호/입양 신청하기
    const applyForProtection = async (animalId, data) => {
        try {
            setLoading(true);
            setError(null);
            const result = await ProtectionApiService.applyForProtection(animalId, data);
            return result;
        } catch (err) {
            setError(err);
            console.error('보호/입양 신청 중 오류 발생:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // 신청 승인하기
    const approveProtection = async (protectionId) => {
        try {
            setLoading(true);
            setError(null);
            const result = await ProtectionApiService.approveProtection(protectionId);
            return result;
        } catch (err) {
            setError(err);
            console.error('신청 승인 중 오류 발생:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // 신청 거절하기
    const rejectProtection = async (protectionId, rejectReason) => {
        try {
            setLoading(true);
            setError(null);
            const result = await ProtectionApiService.rejectProtection(protectionId, rejectReason);
            return result;
        } catch (err) {
            setError(err);
            console.error('신청 거절 중 오류 발생:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // 신청 취소하기
    const cancelApplication = async (protectionId) => {
        try {
            setLoading(true);
            setError(null);
            const result = await ProtectionApiService.cancelApplication(protectionId);
            return result;
        } catch (err) {
            setError(err);
            console.error('신청 취소 중 오류 발생:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        applyForProtection,
        approveProtection,
        rejectProtection,
        cancelApplication
    };
};

// 동물 삭제 훅
export const useAnimalDeletion = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteAnimal = async (id) => {
        try {
            setLoading(true);
            setError(null);
            const result = await ProtectionApiService.deleteAnimal(id);
            return result;
        } catch (err) {
            setError(err);
            console.error('동물 삭제 중 오류 발생:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        deleteAnimal
    };
};