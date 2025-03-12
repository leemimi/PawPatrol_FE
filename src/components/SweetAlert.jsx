import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// 기본 스타일 정의
const defaultCustomClass = {
    popup: 'rounded-3xl shadow-xl border-4 border-orange-100',
    title: 'text-orange-800 font-bold',
    confirmButton: 'rounded-full px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white transition-colors',
    cancelButton: 'rounded-full px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white transition-colors',
    actions: 'mt-4',
    icon: 'text-orange-500'
};

// 상태별 배경색과 아이콘 색상
const themes = {
    success: {
        iconColor: '#F97316',
        background: '#fff8f5'
    },
    error: {
        iconColor: '#EF4444',
        background: '#fff5f5'
    },
    warning: {
        iconColor: '#FFB020',
        background: '#fffbeb'
    },
    info: {
        iconColor: '#60A5FA',
        background: '#f0f9ff'
    },
    question: {
        iconColor: '#8B5CF6',
        background: '#faf5ff'
    }
};

// 토스트 알림 설정
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
        popup: 'rounded-xl border-2 border-orange-200 shadow-lg',
        title: 'text-sm font-medium text-orange-800 ml-2'
    },
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

// 로딩 스피너 HTML
const spinnerHtml = '<div class="flex justify-center"><div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div></div>';

const SweetAlert = {
    /**
     * 성공 알림 표시
     * @param {string} title - 알림 제목
     * @param {string} text - 알림 내용 (선택 사항)
     * @param {boolean} autoClose - 자동 닫힘 여부 (기본값: true)
     */
    success: (title, text, autoClose = true) => {
        return MySwal.fire({
            icon: 'success',
            title,
            text,
            showConfirmButton: !autoClose,
            timer: autoClose ? 1500 : undefined,
            customClass: defaultCustomClass,
            ...themes.success,
            confirmButtonText: '확인'
        });
    },

    /**
     * 에러 알림 표시
     * @param {string} title - 알림 제목
     * @param {string} text - 에러 내용
     */
    error: (title, text) => {
        return MySwal.fire({
            icon: 'error',
            title,
            text,
            customClass: defaultCustomClass,
            ...themes.error,
            confirmButtonText: '확인'
        });
    },

    /**
     * 경고 알림 표시
     * @param {string} title - 알림 제목
     * @param {string} html - HTML 내용 (선택 사항)
     */
    warning: (title, html) => {
        return MySwal.fire({
            icon: 'warning',
            title,
            html,
            customClass: defaultCustomClass,
            ...themes.warning,
            confirmButtonText: '확인'
        });
    },

    /**
     * 정보 알림 표시
     * @param {string} title - 알림 제목
     * @param {string} html - HTML 내용 (선택 사항)
     */
    info: (title, html) => {
        return MySwal.fire({
            icon: 'info',
            title,
            html,
            customClass: defaultCustomClass,
            ...themes.info,
            confirmButtonText: '확인'
        });
    },

    /**
     * 질문/확인 알림 표시
     * @param {string} title - 알림 제목
     * @param {string} text - 질문 내용
     * @param {string} confirmText - 확인 버튼 텍스트 (기본값: '확인')
     * @param {string} cancelText - 취소 버튼 텍스트 (기본값: '취소')
     * @returns {Promise} - 사용자 응답을 담은 Promise
     */
    confirm: (title, text, confirmText = '확인', cancelText = '취소') => {
        return MySwal.fire({
            icon: 'question',
            title,
            text,
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            customClass: {
                ...defaultCustomClass,
                cancelButton: defaultCustomClass.cancelButton
            },
            ...themes.question,
            reverseButtons: true
        });
    },

    /**
     * 로딩 표시
     * @param {string} title - 로딩 제목 (기본값: '처리 중...')
     * @param {string} html - 커스텀 HTML (없으면 기본 스피너 사용)
     */
    loading: (title = '처리 중...', html = spinnerHtml) => {
        return MySwal.fire({
            title,
            html,
            showConfirmButton: false,
            allowOutsideClick: false,
            customClass: {
                popup: defaultCustomClass.popup,
                title: 'text-orange-800 font-bold mt-4'
            },
            background: themes.info.background
        });
    },

    /**
     * 토스트 알림 표시
     * @param {string} title - 알림 제목
     * @param {string} icon - 아이콘 유형 (success, error, warning, info)
     */
    toast: (title, icon = 'success') => {
        let iconColor;
        let background;

        switch (icon) {
            case 'success':
                iconColor = themes.success.iconColor;
                background = themes.success.background;
                break;
            case 'error':
                iconColor = themes.error.iconColor;
                background = themes.error.background;
                break;
            case 'warning':
                iconColor = themes.warning.iconColor;
                background = themes.warning.background;
                break;
            case 'info':
                iconColor = themes.info.iconColor;
                background = themes.info.background;
                break;
            default:
                iconColor = themes.success.iconColor;
                background = themes.success.background;
        }

        return Toast.fire({
            icon,
            title,
            iconColor,
            background
        });
    },

    /**
     * 로딩 알림 닫기
     */
    close: () => {
        MySwal.close();
    },

    /**
     * 이미지 알림 표시
     * @param {string} title - 알림 제목
     * @param {string} imageUrl - 이미지 URL
     * @param {string} text - 알림 내용 (선택 사항)
     */
    image: (title, imageUrl, text) => {
        return MySwal.fire({
            title,
            text,
            imageUrl,
            imageWidth: 200,
            imageHeight: 200,
            imageAlt: title,
            customClass: defaultCustomClass,
            background: themes.info.background,
            confirmButtonText: '확인'
        });
    },

    /**
     * 커스텀 입력 폼 표시
     * @param {string} title - 알림 제목
     * @param {string} inputPlaceholder - 입력 필드 플레이스홀더
     * @param {string} inputValue - 기본 입력값 (선택 사항)
     * @returns {Promise} - 사용자 입력값을 담은 Promise
     */
    input: (title, inputPlaceholder, inputValue = '') => {
        return MySwal.fire({
            title,
            input: 'text',
            inputPlaceholder,
            inputValue,
            showCancelButton: true,
            confirmButtonText: '확인',
            cancelButtonText: '취소',
            customClass: {
                ...defaultCustomClass,
                cancelButton: defaultCustomClass.cancelButton,
                input: 'border-2 border-orange-200 rounded-xl p-2 focus:border-orange-400 focus:outline-none'
            },
            background: themes.info.background,
            reverseButtons: true
        });
    }
};

export default SweetAlert;