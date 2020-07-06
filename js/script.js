$(document).ready(function() {

  // var test = ajaxCallGenre(255);
  // console.log(test);

  // ==============================================================
  // ====================== CLIK ON BUTTON ========================
  $('button.search-movie-btn').click(function() {
    resetSearchResult();

    var inputValue = getInputValue();

    ajaxCall(inputValue,'movie');
    ajaxCall(inputValue,'tv');

  }); // End click

  // ==============================================================
  // ====================== KEYPRESS EVENT ========================
  $('.search-movie').keypress(function(event) {
    if (event.which === 13 ) {
      resetSearchResult();

      var inputValue = getInputValue();

      ajaxCall(inputValue,'movie');
      ajaxCall(inputValue,'tv');
    }
  }); // End keypress event


// ==============================================================
// ======================== FUNZIONI ============================
// ==============================================================

// ==================== getInputValue() =========================
// Funzione getInputValue()
// legge il valore dell'input .search-movie
// ---> return: valore dell'input
function getInputValue() {
    // Leggo il valore all'evento (click, keypress)
    var searchInputValue = $('input.search-movie').val();

    // Resetto il valore dell'input dopo l'evento (click, keypress)
    $('input.search-movie').val('');

    // Ritorno il valore dell'input
    return searchInputValue
};
// --------------------------------------------------------------

// ===================== ajaxCall() =============================
// Funzione ajaxCall
// api_key: 345a41c08ec6d0c01364a6a7cd7a8052
// Chiama il database di Themoviedatabase.org
// Argomenti:
// ---> valoreRicerca = una stringa/testo
// ---> searchType = determina endpoint dell'api può essere di 2 tipi 'tv' oppure 'movie'.
// return: ninete
function ajaxCall(valoreRicerca, searchType) {
  if(searchType === 'movie') {
    var url = "https://api.themoviedb.org/3/search/movie"
  } else if (searchType === 'tv') {
    url = "https://api.themoviedb.org/3/search/tv"
  }
  $.ajax(
    {
      url: url,
      method:"GET",
      data: {
        api_key:"345a41c08ec6d0c01364a6a7cd7a8052",
        query: valoreRicerca,
        page: 1,
        language: 'it-IT',
        // include_adult: true
      },
      success: function(data) {
        var totalResults = data.total_results
        var searchResults = data.results;
        console.log(searchResults)

        if(searchResults.length > 0) {

          if(searchType === 'movie') {
            $('.movies .results-number').text(data.total_results)
          } else {
            $('.tv-series .results-number').text(data.total_results)
          }

          $('.show-results p.risultati').removeClass('hidden');

          printObject(searchResults, searchType);

          objectHover();

        } else {

          noResultsMessage(searchType, data);
        }
      },
      error: function() {
        resetSearchResult();

        var errore = "<i class='fas fa-exclamation-triangle'></i>" + "<p class='first-msg'>" + "Qualcosa non torna" + "</p>" + "<p class='second-msg'>" + 'Devi inserire almeno una parola' + "</p>";

        printMessage(errore);
      }
    }
  ); // End ajax call

} // End function ajaxCall
// --------------------------------------------------------------

// ==================== printObject() =========================
// Function printObject
// Con hendlebars compilo il tamplate:
// Argomenti:
// ---> resultArray = un array di oggetti che ottengo con la chiamata ajax
// ---> searchType = determina l'endpoint della chiamata API (si ottiene leggendo l'argomento della funzione "ajaxCall()"
function printObject(resultArray, searchType) {

  for (var i = 0; i < resultArray.length; i++) {
    // Metto nella variabile singolo oggetto dell'array
    var singleObject = resultArray[i];
    var objectId = singleObject.id


    // var tipoDiFilm = ajaxCallDetails(objectId)
    // console.log(tipoDiFilm)

    // Trasformazione da punteggio 10 a punteggio 5
    var rating = singleObject.vote_average
    var ratingToPrint = movieScore(rating);

    // Trasformazione data di uscita nel formato leggibile
    moment.locale('it');
    var dataUscitaMovie = moment(singleObject.release_date).format('D MMM YYYY');
    var dataUscitaTV = moment(singleObject.first_air_date).format('D MMM YYYY');


    // POSTER
    if (singleObject.poster_path !== null) {
      var poster = 'https://image.tmdb.org/t/p/original' + singleObject.poster_path;
    } else {
      poster = 'img/no-poster1.jpg'
    }

    // GENERE
    if (searchType === 'movie') {
      var tipo = 'Film'
      var titolo = singleObject.title;
      var titoloOriginale = singleObject.original_title;
      var uscita = dataUscitaMovie;
    } else {
      // Cambio le varioabili per i risultati SerieTV
      tipo = 'Serie TV';
      titolo = singleObject.name;
      titoloOriginale = singleObject.original_name;
      uscita = dataUscitaTV;
    }

    // Compilo il template
    var source = $('#movies-template').html();
    var template = Handlebars.compile(source);

    // Metto nell'oggetto le chiavi del risultato e stampo i relativi valori
    var context = {
      // COMMON
      "poster" : poster,
      "tipo": tipo,
      "titolo" : titolo,
      "titolo-originale": titoloOriginale,
      "uscita": uscita,
      "overview": singleObject.overview,
      "lingua": singleObject.original_language,
      "voto_medio": ratingToPrint,
      "object_id": objectId
    }

    var html = template(context);

    // Appendo il template compilato nel container apposito
    if (searchType === 'movie') {
      $('.show-results .container.movies-results').append(html);
    } else {
      $('.show-results .container.tv-series-results').append(html);
    }
    // Stamo a schermo
    ajaxCallDetails(objectId, tipo);

  } // End ciclo for

}
// --------------------------------------------------------------

// ==================== resetPage() =============================
// Funzione resetPage()
// Azzero i risultati della pagina qualora fossero presenti
function resetSearchResult() {
  $('.show-results p.risultati').addClass('hidden');

  $('.movies .results-number').text('');
  $('.show-results .container.movies-results').html('');

  $('.tv-series .results-number').text('');
  $('.show-results .container.tv-series-results').html('');

}
// --------------------------------------------------------------

// ==================== printMessage() ==========================
// Funzione messagio di ERRORE
// argomento deve essere una stringa
function printMessage(text) {
  // Compilo il template
  var source = $('#message-template').html();
  var template = Handlebars.compile(source);

  var context = { message: text }
  var html = template(context);

  // Appendo il template compilato nel container apposito
  $('.show-results .container').append(html)
}
// --------------------------------------------------------------


// ==================== movieScore() ============================
// Funzione trasformazione voto
function movieScore(rating) {
  // Trasformazione punteggio a 5 punti
  var ratingTrasformato = rating / 2;

  var vote = Math.round(ratingTrasformato);

  var stars = '';
  for (var i = 1; i <= 5; i++) {
      if (i <= vote) {
        stars += '<i class="fas fa-star"></i>';
      } else {
        stars += '<i class="far fa-star"></i>';
      }
  }
  return stars;
}
// --------------------------------------------------------------

// ==================== noResultsMessage() ============================
// stamo il messagio quando la ricerca non ha prodotto i risultati
function noResultsMessage(searchType, data) {
  $('.show-results p.risultati').removeClass('hidden');
  var noResultsMessage = '<span class="no-results-message">'+ "La ricerca non ha prodotto risultati" + '<span>';

  if(searchType === 'movie') {
    $('.movies .results-number').text(data.total_results);
    $('.show-results .container.movies-results').html(noResultsMessage);
  } else {
    $('.tv-series .results-number').text(data.total_results);
    $('.show-results .container.tv-series-results ').html(noResultsMessage);
  }

  return noResultsMessage;
}
// --------------------------------------------------------------

// ==================== objectHover() ============================
// Al maousehover nascondo il poster e mostro informazioni sul film
function objectHover() {
  $('.movie-container').each(function() {
    var singoloFilm = $(this);

    singoloFilm.mouseenter( function() {
      singoloFilm.find('.data-content').addClass('active');
      singoloFilm.find('.front-side').addClass('active');

      // var objectId = $(singoloFilm).attr('data-id');
      // var tipo = $(singoloFilm).find('.tipo').text();
      // console.log(tipo)
      // ajaxCallDetails(objectId, tipo);
     $(singoloFilm).find('.show-overview').click(function() {
       $('.overview').slideDown();
     })

     $(singoloFilm).find('.hide-overview').click(function() {
       $('.overview').slideUp();
     })
    });


    singoloFilm.mouseleave( function() {
      singoloFilm.find('.data-content').removeClass('active');
      singoloFilm.find('.front-side').removeClass('active');
      singoloFilm.find('.overview').slideUp();
      // setTimeout(function() {
      //   $(singoloFilm).find('.details').html('')
      // }, 500)

    });

  });
}
// --------------------------------------------------------------

// ==================== ajaxCallDetails() =======================
function ajaxCallDetails(id, tipo) {
  if(tipo === 'Film') {
    var url = "https://api.themoviedb.org/3/movie/";
  } else if (tipo === 'Serie TV') {
    url = "https://api.themoviedb.org/3/tv/";
  }
  $.ajax(
    {
      url: url + id,
      method:"GET",
      data: {
        append_to_response: 'credits',
        api_key:"345a41c08ec6d0c01364a6a7cd7a8052",
      },
      success: function(data) {
        var objectGenres = data.genres; // array di oggetti

        var objectCredits = data.credits;
        var objectCast = objectCredits.cast;

        printDetails(objectGenres, objectCast, id);

      },
      error: function() {
        console.log('errore del XXX')
      }
    }
  ); // End ajax call

} // end function
// --------------------------------------------------------------


// ==================== printDetails() =======================
function printDetails(objectGenres, objectCast, id) {
  var objectCard = $('.movie-container[data-id="'+ id +'"]');

    // GENRES
    var genresNames = [];
    for (var i = 0; i < objectGenres.length; i++) {
      var singleGenre = objectGenres[i];
      genresNames.push(singleGenre.name);
    }

    // CAST
    var actorsNames = [];
    for (var i = 0; i < objectCast.length; i++) {
      var singleActor = objectCast[i];
      actorsNames.push(singleActor.name);
    }
    // Seleziono solo i primi 5 attori
    var fiveActors = actorsNames.slice(0, 5);

    // Compilo il template
    var source = $('#details-template').html();
    var template = Handlebars.compile(source);

    var context = {
      genres: genresNames.join(", "),
      credits: fiveActors.join(", "),
    }
    var html = template(context);

    // Appendo il template compilato nel container apposito
    $(objectCard).find('.details').append(html);

} // End function


// --------------------------------------------------------------

}) // end document ready
