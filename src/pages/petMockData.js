// 실종 동물 데이터
export const lostPets = [
    {
        id: 1,
        name: "초코",
        type: "강아지",
        breed: "푸들",
        age: 3,
        gender: "남아",
        status: "목격 제보 확인중",
        lastSeen: {
            location: "서울시 강남구 대치동",
            time: "2시간 전"
        },
        description: "갈색 푸들, 분홍색 목줄 착용",
        imageUrl: null,
        owner: {
            id: 1,
            name: "김철수",
            contact: "010-1234-5678"
        }
    },
    {
        id: 2,
        name: "몽이",
        type: "고양이",
        breed: "러시안블루",
        age: 2,
        gender: "여아",
        status: "실종",
        lastSeen: {
            location: "서울시 강남구 삼성동",
            time: "3시간 전"
        },
        description: "회색 러시안블루, 하늘색 목줄 착용",
        imageUrl: null,
        owner: {
            id: 2,
            name: "이영희",
            contact: "010-2345-6789"
        }
    }
];

// 목격 제보 데이터
export const petSightings = [
    {
        id: 1,
        petId: 1,
        location: "강남구 대치동에서 목격",
        time: "방금 전",
        description: "은마아파트 놀이터 근처에서 갈색 푸들 목격",
        status: "확인중",
        reporter: {
            id: 3,
            name: "박지성"
        }
    },
    {
        id: 2,
        petId: 1,
        location: "삼성동 코엑스 근처에서 발견",
        time: "30분 전",
        description: "코엑스 정문 앞에서 갈색 푸들 발견",
        status: "확인중",
        reporter: {
            id: 4,
            name: "김민지"
        }
    },
    {
        id: 3,
        petId: 1,
        location: "청담동 공원 주변 목격",
        time: "1시간 전",
        description: "청담동 공원에서 산책하는 모습 목격",
        status: "확인중",
        reporter: {
            id: 5,
            name: "이상훈"
        }
    },
    {
        id: 4,
        petId: 1,
        location: "대치동 은마아파트 인근 발견",
        time: "2시간 전",
        description: "은마아파트 상가 근처에서 발견",
        status: "확인중",
        reporter: {
            id: 6,
            name: "최지원"
        }
    }
];

// 통계 데이터
export const petStatistics = {
    totalCases: 15,
    activeCases: {
        dogs: 10,
        cats: 5
    },
    todayReports: 3,
    byDistrict: {
        "강남구": 8,
        "서초구": 4,
        "송파구": 3
    }
};