import { useEffect, useRef } from 'react';

const useArrowScroll = () => {
    const lastClickedScrollable = useRef(null);

    useEffect(() => {
        // כשלוחצים על משהו, מצא את האלמנט הגולל הקרוב ביותר
        const handleClick = (e) => {
            let element = e.target;
            
            // עלה במעלה עץ ה-DOM עד שנמצא אלמנט שניתן לגלול
            while (element && element !== document.body) {
                const style = window.getComputedStyle(element);
                const hasOverflow = style.overflowY === 'auto' || style.overflowY === 'scroll' || 
                                   element.classList.contains('overflow-y-auto') ||
                                   element.classList.contains('overflow-auto');
                const canScroll = element.scrollHeight > element.clientHeight;
                
                if (hasOverflow && canScroll) {
                    lastClickedScrollable.current = element;
                    return;
                }
                
                element = element.parentElement;
            }
            
            // אם לא מצאנו אלמנט גולל - נגלול את החלון
            lastClickedScrollable.current = null;
        };

        // כשלוחצים על חיצים - גלול את האלמנט שלחצנו עליו
        const handleKeyDown = (e) => {
            if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

            // בדוק אם בתוך input/textarea/select
            const tag = document.activeElement?.tagName?.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'select' || document.activeElement?.isContentEditable) {
                return;
            }

            e.preventDefault();
            
            const scrollAmount = 50;
            const direction = e.key === 'ArrowDown' ? scrollAmount : -scrollAmount;

            // גלול את האלמנט שלחצנו עליו
            if (lastClickedScrollable.current) {
                lastClickedScrollable.current.scrollTop += direction;
            } else {
                // אם לא לחצנו על כלום - מצא את העמוד/דרוואר הפעיל
                const scrollableElements = Array.from(
                    document.querySelectorAll('.overflow-y-auto, .overflow-auto')
                ).filter(el => el.scrollHeight > el.clientHeight);
                
                // גלול את האחרון (הדרוואר/מודאל אם יש, או העמוד הראשי)
                if (scrollableElements.length > 0) {
                    scrollableElements[scrollableElements.length - 1].scrollTop += direction;
                } else {
                    window.scrollBy(0, direction);
                }
            }
        };

        document.addEventListener('click', handleClick);
        window.addEventListener('keydown', handleKeyDown);
        
        return () => {
            document.removeEventListener('click', handleClick);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
};

export default useArrowScroll;
