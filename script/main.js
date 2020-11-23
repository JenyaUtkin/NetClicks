const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';


const leftMenu = document.querySelector('.left-menu'),
    hamburger = document.querySelector('.hamburger'),
    tvShowsList = document.querySelector('.tv-shows__list'),
    modal = document.querySelector('.modal'),
    tvShows = document.querySelector('.tv-shows'),
    tvCardImg = document.querySelector('.tv-card__img'),
    modalTitle = document.querySelector('.modal__title'),
    genresList = document.querySelector('.genres-list'),
    rating = document.querySelector('.rating'),
    description = document.querySelector('.description'),
    modalLink = document.querySelector('.modal__link'),
    searchForm = document.querySelector('.search__form'),
    searchFormInput = document.querySelector('.search__form-input'),
    preloader = document.querySelector('.preloader'),
    dropdown = document.querySelectorAll('.dropdown'),
    tvShowsHead = document.querySelector('.tv-shows__head'),
    posterWrapper = document.querySelector('.poster__wrapper'),
    modalContent = document.querySelector('.modal_content'),
    pagination = document.querySelector('.pagination');


const loading = document.createElement('div');
loading.className = 'loading';

class DBService {
constructor(){
    this.SERVER = 'https://api.themoviedb.org/3';
    this.API_KEY = '2dd22b687a0ad86506fb9e3b98ddd631';
    }

    getData = async (url) => {
        
        const res = await fetch(url);
        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`Не удалось получить данные по адресу ${url}`);
        }
        
    }

    getTestData = () => {
        return this.getData('/test.json');
    }
    getTestCard = () => {
        return this.getData('/card.json');
    }
    getSearchResult = query => {
    this.temp = `${this.SERVER}/search/tv?api_key=${this.API_KEY}&language=ru-RU&query=${query}`;
    return this.getData(`this.temp`);
    }
    getNextPage = page => {
        return this.getData(this.temp + '&page' + page);
    }
    
    
    getTvShow = id => this.getData(`${this.SERVER}/tv/${id}?api_key=${this.API_KEY}&language=ru-RU`);

    getTopRated = () => this.getData(`${this.SERVER}/tv/top_rated?api_key=${this.API_KEY}&language=ru-RU`);

    getPopular = () => this.getData(`${this.SERVER}/tv/popular?api_key=${this.API_KEY}&language=ru-RU`);

    getToday = () => this.getData(`${this.SERVER}/tv/airing_today?api_key=${this.API_KEY}&language=ru-RU`);

    getWeek = () => this.getData(`${this.SERVER}/tv/on_the_air?api_key=${this.API_KEY}&language=ru-RU`);
    }

const dbservice = new DBService();

const renderCard = (response, target) => {

    tvShowsList.textContent = '';

    

    if(!response.total_results){
        loading.remove();
        tvShowsHead.textContent = 'К сожалению по вашему запросу нечего не найдено...';
        tvShowsHead.style.cssText = 'red';
        return;
    }

        tvShowsHead.textContent = target ? target.textContent : 'Результат поиска';
        tvShowsHead.style.cssText = 'black';

    response.results.forEach(item => {

        const {
            backdrop_path: backdrop,
            name: title,
            poster_path: poster,
            vote_average: vote,
            id
            } = item;

        const posterIMG = poster ? IMG_URL + poster : '/img/no-poster.jpg';
        const backdropIMG = backdrop ? IMG_URL + backdrop : '';
        const voteElem  = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

        const card = document.createElement('li');
        card.idTV = id;
        card.className = 'tv-shows__item';
        card.innerHTML = `
        <a href="#" id="${id}" class="tv-card">
            ${voteElem}
            <img class="tv-card__img"
                src="${IMG_URL + poster}"
                data-backdrop="${backdropIMG}"
                alt=${title}>
            <h4 class="tv-card__head">${title}</h4>
        </a>
        `;
        loading.remove();
        tvShowsList.append(card);
    })
    
    pagination.textContent = '';

    if(!target && response.total_pages > 1) {
        for(let i = 1; i <= response.total_pages; i++) {
            pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`
        }
    }

}

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const value = searchFormInput.value.trim();
    if(value) {
        tvShows.append(loading);
        dbservice.getSearchResult(value).then(renderCard);
    }
    searchFormInput.value = '';
});

    const closeDropdown = () => {
        dropdown.forEach(item => {
            item.classList.remove('active');
        })
    };

//открытие закрытие меню
hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
    closeDropdown();
});

document.addEventListener('click', event => {
    const target = event.target;
    if (!target.closest('.left-menu')) {
    leftMenu.classList.remove('openMenu');
    hamburger.classList.remove('open');
    closeDropdown();
    }
});

leftMenu.addEventListener('click', event =>{
    event.preventDefault();
    const target = event.target;
    const dropdown = target.closest('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }

        if (target.closest('#top-rated')) {
            tvShows.append(loading);
            dbservice.getTopRated().then((response) => renderCard(response, target));
        }
        if (target.closest('#popular')) {
            tvShows.append(loading);
            dbservice.getPopular().then((response) => renderCard(response, target));
        }
        if (target.closest('#week')) {
            tvShows.append(loading);
            dbservice.getWeek().then((response) => renderCard(response, target));
        }
        if (target.closest('#today')) {
            tvShows.append(loading);
            dbservice.getToday().then((response) => renderCard(response, target));
        }
        if(target.closest('#search')) {
            tvShowsList.textContent = '';
            tvShowsHead.textContent = '';
        }



});

// открытие окна



tvShowsList.addEventListener('click', event => {

    event.preventDefault();

    const target = event.target;
    const card = target.closest('.tv-card');
    
    if(card) {
        preloader.style.display = 'block';

        dbservice.getTvShow(card.id)
            .then(({
                poster_path: posterPath,
                name: title,
                genres,
                vote_average: voteAverage,
                overview,
                homepage}) => {

                if(posterPath) {
                tvCardImg.src = IMG_URL + posterPath;
                tvCardImg.alt = title;
                posterWrapper.style.display = ''; 
                } else {
                    posterWrapper.style.display = 'none'; 
                    modalContent.style.paddinLeft = '25px';
                }

                tvCardImg.src = IMG_URL + posterPath;
                tvCardImg.alt = title;
                modalTitle.textContent = title;
                genresList.textContent = '';
                genres.forEach(item => {
                    genresList.innerHTML += `<li>${item.name}</li>`;
                });
                rating.textContent = voteAverage;
                description.textContent = overview;
                modalLink.href = homepage;

            })
            .then(() => {
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');
            })
            .finally(() => {
                preloader.style.display ='';
            })
    }
});

//закрытие 
modal.addEventListener('click', event => {

    if (event.target.closest('.cross') || 
        event.target.classList.contains('modal')) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
});

//  смена карточки 
const changeImage = event => {
    const card = event.target.closest('.tv-shows__item');

    if (card) {
        const img = card.querySelector('.tv-card__img');
        if(img.dataset.backdrop){
            [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src]
        
        }
    }
};
tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);
pagination.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;

    if(target.classList.contains('pages')) {
        tvShows.append(loading);
        dbservice.getNextPage(target.textContent).then(renderCard);

    }
})

