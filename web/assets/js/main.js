/**
 * Template Name: NiceAdmin
 * Template URL: https://bootstrapmade.com/nice-admin-bootstrap-admin-html-template/
 * Updated: Apr 7 2024 with Bootstrap v5.3.3
 * Author: BootstrapMade.com
 * License: https://bootstrapmade.com/license/
 */

(function () {
	"use strict";

	/**
	 * Easy selector helper function
	 */
	const select = (el, all = false) => {
		el = el.trim();
		if (all) {
			return [...document.querySelectorAll(el)];
		} else {
			return document.querySelector(el);
		}
	};

	/**
	 * Easy event listener function
	 */
	const on = (type, el, listener, all = false) => {
		if (all) {
			select(el, all).forEach((e) => e.addEventListener(type, listener));
		} else {
			select(el, all).addEventListener(type, listener);
		}
	};

	/**
	 * Easy on scroll event listener
	 */
	const onscroll = (el, listener) => {
		el.addEventListener("scroll", listener);
	};

	/**
	 * Search bar toggle
	 */
	if (select(".search-bar-toggle")) {
		on("click", ".search-bar-toggle", function (e) {
			select(".search-bar").classList.toggle("search-bar-show");
		});
	}

	/**
	 * Navbar links active state on scroll
	 */
	let navbarlinks = select("#navbar .scrollto", true);
	const navbarlinksActive = () => {
		let position = window.scrollY + 200;
		navbarlinks.forEach((navbarlink) => {
			if (!navbarlink.hash) return;
			let section = select(navbarlink.hash);
			if (!section) return;
			if (
				position >= section.offsetTop &&
				position <= section.offsetTop + section.offsetHeight
			) {
				navbarlink.classList.add("active");
			} else {
				navbarlink.classList.remove("active");
			}
		});
	};
	window.addEventListener("load", navbarlinksActive);
	onscroll(document, navbarlinksActive);

	/**
	 * Toggle .header-scrolled class to #header when page is scrolled
	 */
	let selectHeader = select("#header");
	if (selectHeader) {
		const headerScrolled = () => {
			if (window.scrollY > 100) {
				selectHeader.classList.add("header-scrolled");
			} else {
				selectHeader.classList.remove("header-scrolled");
			}
		};
		window.addEventListener("load", headerScrolled);
		onscroll(document, headerScrolled);
	}

	/**
	 * Back to top button
	 */
	let backtotop = select(".back-to-top");
	if (backtotop) {
		const toggleBacktotop = () => {
			if (window.scrollY > 100) {
				backtotop.classList.add("active");
			} else {
				backtotop.classList.remove("active");
			}
		};
		window.addEventListener("load", toggleBacktotop);
		onscroll(document, toggleBacktotop);
	}

	/**
	 * Initiate tooltips
	 */
	var tooltipTriggerList = [].slice.call(
		document.querySelectorAll('[data-bs-toggle="tooltip"]')
	);
	var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
		return new bootstrap.Tooltip(tooltipTriggerEl);
	});

  /**
   * Autoresize echart charts
   */
  const mainContainer = select('#main');
  if (mainContainer) {
    setTimeout(() => {
      new ResizeObserver(function() {
        select('.echart', true).forEach(getEchart => {
          echarts.getInstanceByDom(getEchart).resize();
        })
      }).observe(mainContainer);
    }, 200);
  }

})();




function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getGenre(){
  fetch("../../../manga/hasil.json")
  .then((res)=>{
    if (!res){
      throw new Error
      ('HTTP error! Status: ${res.status}')
    }
    return res.json()
  })
  .then((data)=>{
    let genre = []
    let genreVolume = []
    for (i in data){
      genre = Array.from(new Set([...genre, ...data[i]['genre']]))
    }
    for (i in genre){
      genreVolume[i]=0
      for (j in data){
        if ((data[j]['genre']).includes(genre[i])){
          genreVolume[i] = genreVolume[i] + 1
        }
      }
    }
    let combinedArray = genreVolume.map((value, index) => ({ amount: value, genres: genre[index] }));
    combinedArray.sort((a, b) => b.amount - a.amount);
    genre = combinedArray.map(obj => obj.genres)
    genreVolume = combinedArray.map(obj => obj.amount)

    var barColors = Array.from({length: genre.length}, () => getRandomColor());
    myChart = new Chart("pieChart", {
        type: "pie",            //jenis chart
        data: {
          labels: genre.slice(0,20),      //informasi per kategori
          datasets: [{
            backgroundColor: barColors, //warna tiap kategori
            data: genreVolume.slice(0,20)               //jumlah pengeluaran tiap kategori
          }]
        },
        options: {
          title: {
            display: true,
            text: "Genre Distribution"
          }
        }
    });
  })
  .catch((error)=>
  console.error("Unable to fetch data:",error))
}
getGenre()

//function to convert score to stars
function scoreToStars(score) {
  // Convert the score to a number of full and half stars
  var fullStars = Math.floor(score / 2);
  var halfStars = score % 2 === 0 ? 0 : 1;
  var emptyStars = 5 - fullStars - halfStars;

  // Generate the HTML for the stars
  var starsHtml = '';
  for (var i = 0; i < fullStars; i++) {
      starsHtml += '<img src="assets/img/fullstar.png" style="width: 20px;height: 20px;">';
  }
  for (var i = 0; i < halfStars; i++) {
      starsHtml += '<img src="assets/img/halfstar.png" style="width: 20px;height: 20px;">';
  }
  for (var i = 0; i < emptyStars; i++) {
      starsHtml += '<img src="assets/img/emptystar.png" style="width: 20px;height: 20px;">';
  }

  return starsHtml;
}

//a function to filter the data based on the genre selected
function filter() {
  var genre = document.getElementById('genre-selector').value;
  var type = document.getElementById('type-selector').value;

  if ($.fn.DataTable.isDataTable('#datatable')) {
    $('#datatable').DataTable().destroy();
  }
  datatable = $('#datatable').DataTable({
    ajax: { url: "../../../manga/hasil.json", dataSrc: "" },
    scrollX: true,
    columns: [
      { 
        data: "rank",
        orderable: true,
        orderSequence: ["asc", "desc"]
      },
      {
        data: "image",
        render: function (data) {
          return '<img src="' + data + '" alt="Image" style="max-width: 150px; border-radius: 10px;">';
        },
        orderable: false
      },
      { 
        data: "title",
        orderable: true,
        orderSequence: ["asc", "desc"]
      },
      { 
        data: "type",
        orderable: false
      },
      { 
        data: "score",
        orderable: true,
        orderSequence: ["asc", "desc"],
      },
      { 
        data: "score",
        orderable: true,
        orderSequence: ["asc", "desc"],
        width: "100px",
        render: function(data, type, row) {
            if (type === 'display') {
                return scoreToStars(data);
            } else {
                return data;  // Return the raw score for sorting and filtering
            }
        }
      },
      { 
        data: "genre",
        orderable: false
      },
      { 
        data: "members",
        orderable: true,
        orderSequence: ["asc", "desc"]
      },
      { 
        data: "authors",
        render: function (data) {
          let result = '';
          data.forEach(author => {
            const { name, role } = author;
            result += `${name} (${role})\n`;
          });
          return result;
        },
        orderable: false
      },
			{ data: "status" },
			{ 
        data: "published",
        orderable: false,
      },
			{
				data: "characters",
        orderable: false,
				render: function (data) {
					return (
						`<button type='button' class='btn btn-primary show-characters' data-bs-toggle='modal' data-bs-target='#smallModal' data-character='${JSON.stringify(data)}'>Show</button>`
					);
				},
			},
      {
        data: "sinopsis",
        render: function (data) {
          return '<textarea class="form-control" style="width: 300px;" rows="4" readonly>' + data + '</textarea>'
        },
        orderable: false
      }
    ],
    initComplete: function(settings, json) {
      var datatable = this.api();
      var rank = 1;
      datatable.rows().every(function (rowIdx, tableLoop, rowLoop) {
        var genres = datatable.cell(rowIdx, 5).data();
        var types = datatable.cell(rowIdx, 3).data();

        if ((genre === "all_genre" || genres.includes(genre)) && (type === "all_type" || types === type)) {
          datatable.cell(rowIdx, 0).data(rank++);
        }
        else {
          datatable.row(rowIdx).remove();
        }
      });
      datatable.draw();
    }
  })
}

document.addEventListener('DOMContentLoaded', filter);

const table = document.querySelector("#datatable");
table.addEventListener("click", function (event) {
	if (event.target.matches(".show-characters")) {
		console.log(event.target);
		const characters = JSON.parse(event.target.dataset.character);
		const carouselItems = document.querySelector(".carousel-inner");
		carouselItems.innerHTML = "";
		characters.forEach((character, index) => {
			const { name, role, image } = character;
			carouselItems.innerHTML += `
          <div
          class="carousel-item ${index === 0 ? 'active' : ''}">
            <img
              src="${image}"
              class="d-block w-100"
              alt="..." />
            <div
              class="carousel-caption">
              <h5 style="text-shadow: 2px 2px 2px #000;">
                ${name}
              </h5>
              <p class="mb-0" style="text-shadow: 1px 1px 1px #000;">
                ${role}
              </p>
            </div>
          </div>
        `;
		});
	}
});