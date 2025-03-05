import React, { useRef, useCallback } from 'react';

const InfiniteScroll = ({
    items,
    hasMore,
    loading,
    loadMore,
    renderItem,
    loadingComponent,
    emptyComponent,
    endMessage,
    className = "space-y-3"
}) => {
    const observer = useRef();

    const lastItemRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadMore]);

    // 데이터가 없는 경우
    if (items.length === 0 && !loading) {
        return emptyComponent || null;
    }

    return (
        <div className={className}>
            {items.map((item, index) => (
                <div
                    key={item.id || index}
                    ref={index === items.length - 1 ? lastItemRef : null}
                >
                    {renderItem(item, index)}
                </div>
            ))}

            {loading && loadingComponent}

            {!hasMore && items.length > 0 && endMessage}
        </div>
    );
};

export default InfiniteScroll;