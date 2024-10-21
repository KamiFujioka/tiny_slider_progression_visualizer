function createProgressSlider(containerId, options = {}) {
    const defaultOptions = {
        navContainerId: `${containerId}-nav`,
        slideDuration: 5000,
        sliderOptions: {}
    };
    const config = { ...defaultOptions, ...options };

    document.addEventListener("DOMContentLoaded", function() {
        const slider = tns({
            container: `#${containerId}`,
            items: 1,
            slideBy: 'page',
            autoplay: false,
            controls: false,
            nav: false,
            ...config.sliderOptions
        });

        const slideCount = slider.getInfo().slideCount;
        const navContainer = document.getElementById(config.navContainerId);
        let progressTimer = null;
        let isPaused = false;

        function createNavButton(index) {
            let button = document.createElement('button');
            button.className = 'w-2 h-2 rounded-full bg-slate-100';
            button.addEventListener('click', () => {
                slider.goTo(index);
                resetProgress();
                updateActiveButton();
            });
            return button;
        }

        function createProgressBar() {
            let progressBar = document.createElement('div');
            progressBar.className = 'relative h-2 w-16 rounded-full overflow-hidden bg-slate-400';
            let progressInner = document.createElement('div');
            progressInner.className = 'h-full absolute bg-slate-100 progress-inner';
            progressInner.style.width = '0%';
            progressBar.appendChild(progressInner);
            return progressBar;
        }

        function updateActiveButton() {
            let info = slider.getInfo();
            let index = info.index % slideCount;

            Array.from(navContainer.children).forEach((btn, idx) => {
                if (idx === index) {
                    let progressBar = createProgressBar();
                    navContainer.replaceChild(progressBar, btn);
                    if (!isPaused) {
                        startProgress(progressBar.querySelector('.progress-inner'));
                    }
                } else if (btn.tagName === 'DIV') {
                    let newButton = createNavButton(idx);
                    navContainer.replaceChild(newButton, btn);
                }
            });
        }

        function startProgress(progressInner) {
            resetProgress();

            if (isPaused) return;

            let startTime = Date.now();
            let pausedTime = 0;

            function animate() {
                if (isPaused) {
                    pausedTime = Date.now() - startTime;
                    return;
                }

                let elapsed = Date.now() - startTime - pausedTime;
                let progress = Math.min((elapsed / config.slideDuration) * 100, 100);
                progressInner.style.width = `${progress}%`;

                if (progress < 100) {
                    progressTimer = requestAnimationFrame(animate);
                } else {
                    slider.goTo('next');
                }
            }

            progressTimer = requestAnimationFrame(animate);
        }

        function resetProgress() {
            if (progressTimer) {
                cancelAnimationFrame(progressTimer);
                progressTimer = null;
            }
        }

        // Création des boutons de navigation
        for (let i = 0; i < slideCount; i++) {
            navContainer.appendChild(createNavButton(i));
        }

        // Gestion du survol
        const sliderElement = document.getElementById(containerId);
        sliderElement.addEventListener('mouseenter', () => {
            isPaused = true;
            resetProgress();
        });
        sliderElement.addEventListener('mouseleave', () => {
            isPaused = false;
            updateActiveButton();
        });

        slider.events.on('indexChanged', updateActiveButton);

        // Initialisation
        updateActiveButton();
    });
}
