$(document).ready(function () {

    var table_index_row = 100000000;
    var data_table_temp = {};
    $('#id_operator').val(1);
    $('#id_order').val('empty');
    $('#count_cart_film').val(0);

    var table_resultado_reporte = $("#table-resultado-reporte").DataTable({

        columns: [
            {"data": "name"},
            {"data": "year"},
            {"data": "summary"},
            {
                "data": "null",
                "defaultContent": "<a data-toggle='modal' rel='add_rent' class='icon_edit' data-target='#modal-data-movies'><i class='ion ion-plus-circled' aria-hidden='true'></i></a>"
            }

        ],
        "language": {
            "emptyTable": "Not Data"
        },
        rowCallback: function (row, data) {
        },
        filter: true,
        info: false,
        ordering: true,
        processing: true,
        retrieve: true
    });

//////////////////////////////
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    var csrftoken = getCookie('csrftoken');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    function sameOrigin(url) {
        // test that a given url is a same-origin URL
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }

    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
                // Send the token to same-origin, relative URLs only.
                // Send the token only if the method warrants CSRF protection
                // Using the CSRFToken value acquired earlier
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    /////////////////////

    function clear_table(table) {
        table
            .clear()
            .draw();
    }

    function cargar_datos_reporte() {

        var name = $('#name').val();
        var actor = $('#actor').val();
        var free = 0;
        var director = $('#director').val();


        var data_value = {};

        if ($('#free').prop('checked'))
            free = 1;
        data_value = {
            name: name,
            actor: actor,
            free: free,
            director: director
        }

        $('#loading').removeClass('hidden');
        $.ajax({
            type: "post",
            data: data_value,
            url: "/query_movies/",
            dataType: "json",
            success: function (data) {
                var total_consulta = data.total_consulta;
                clear_table(table_resultado_reporte);

                var id_result = [];

                $.each(data.data, function (i) {
                    id_result.push(data.data[i].id_movie);
                    data.data[i].table_index = i;
                    table_resultado_reporte
                        .row
                        .add(data.data[i])
                        .draw(false);
                })

                $('#loading').addClass('hidden');
                $("#total_consulta").html(total_consulta);
            }
        });
    }

    $('#button-generar-reporte').on("click", function () {
        cargar_datos_reporte();
    });


    /////////////////////////////////////////////

    function toast_saved_ok() {
        toastr.options = {
            "closeButton": false,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-top-center",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        }

        toastr.success('Movie added...')
    }

    function toast_saved_ok_rent(user_code) {
        toastr.options = {
            "closeButton": false,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-top-center",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        }

        toastr.success('Rent added to : ' + user_code);

    }

    $('#button_rent').on("click", function () {
        var user_code = $('#user_code').val();
        $.ajax({
            type: "post",
            data: {user_code: user_code},
            url: "/rent_movies_final/",
            dataType: "json",
            success: function (data) {
                if (data != null) {
                    if (data.ok == false) {
                        toastr.error('You can not make a rent...')
                    }
                    else {
                        toast_saved_ok_rent(user_code);
                        clear_table(table_resultado_reporte);
                        $('#cart_list').html('');
                        $('#make_rent_cart').addClass('hidden');
                        $('#count_cart_film').html('');
                        $('#button-generar-reporte').addClass('hidden');
                        $('#filter_inputs').addClass('hidden');
                        $('#new-rent-button').removeClass("hidden");
                    }
                }
            }
        });
    });

    $("#name").keypress(function (e) {
        if (e.which == 13) {
            cargar_datos_reporte();
        }
    });

    $('#new-rent-button').on("click", function () {
        $('#id_order').val('empty');
        $('#name').val('');
        $('#button-generar-reporte').removeClass('hidden');
        $('#filter_inputs').removeClass('hidden');
        $('#new-rent-button').addClass("hidden");

    });


    $('#table-resultado-reporte tbody').on('click', 'a', function () {
        var data = table_resultado_reporte.row($(this).parents('tr')).data();
        var action = $(this).attr('rel');
        //clear_modal();
        table_index_row = data.table_index;
        data_table_temp = data;

        var id_operator = $('#id_operator').val();
        var id_order = $('#id_order').val();

        if (data.id_movie != null) {
            $.ajax({
                type: "post",
                data: {id_movie: data.id_movie, action: action, id_operator: id_operator, id_order: id_order},
                url: "/make_a_rent/",
                dataType: "json",
                success: function (data) {
                    if (data != null) {
                        if (data.exist == true) {
                            toastr.error('This movie was already added...')
                        }
                        else {
                            $('#id_order').val(data.id_order);
                            $('#count_cart_film').html('(' + data.count_cart_film + ')');
                            toast_saved_ok();
                            var component = '';
                            component += '<li><a href="#"><div><strong>Name:' + data.name_last + '</strong></div><div>Year:' + data.year_last + '</div></a></li><li class="divider"></li>'
                            $('#make_rent_cart').removeClass('hidden');

                            $('#cart_list').append(component);
                        }
                    }
                }
            });
        }
    });


})
;

$('#make_rent_cart').on("click", function () {

});




