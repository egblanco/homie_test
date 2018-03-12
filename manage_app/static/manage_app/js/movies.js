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
                "defaultContent": "<a data-toggle='modal' rel='edit' class='icon_edit' data-target='#modal-data-movies'><i class='ion ion-edit' aria-hidden='true'></i></a>"
            },
            {
                "data": "null",
                "defaultContent": "<a data-toggle='modal' rel='detail' class='icon_detail'  data-target='#modal-data-movies'><i class='ion-ios-list-outline' aria-hidden='true'></i></a>"
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

    function disabled_form_movie() {
        $('#id_movie').attr("disabled", "disabled");
        $('#director_data').attr("disabled", "disabled");
        $('#clasification').attr("disabled", "disabled");
        $('#main_character').attr("disabled", "disabled");
        $('#name_data').attr("disabled", "disabled");
        $('#number_copies').attr("disabled", "disabled");
        $('#summary').attr("disabled", "disabled");
        $('#year').attr("disabled", "disabled");
        $('#save').addClass("hidden");
    }

    function enabled_form_movie() {
        $('#id_movie').removeAttr("disabled", "disabled");
        $('#director_data').removeAttr("disabled", "disabled");
        $('#clasification').removeAttr("disabled", "disabled");
        $('#main_character').removeAttr("disabled", "disabled");
        $('#name_data').removeAttr("disabled", "disabled");
        $('#number_copies').removeAttr("disabled", "disabled");
        $('#summary').removeAttr("disabled", "disabled");
        $('#year').removeAttr("disabled", "disabled");
        $('#save').removeClass("hidden");
    }

    function clear_form() {
        $('#id_movie').val('');
        $('#director_data').val('');
        $('#clasification').val('');
        $('#main_character').val('');
        $('#name_data').val('');
        $('#number_copies').val('');
        $('#summary').val('');
        $('#year').val('');
        $('#save').removeClass("hidden");
    }

    $('#button-create-movie').on('click', function () {
        $('#action').val('new_movie');
        clear_form();
        $('#title_movie_data').html("<i class='ion ion-plus-circled' aria-hidden='true'></i> New Movie");
        enabled_form_movie();
        clear_table(table_resultado_reporte);
    });

    $('#table-resultado-reporte tbody').on('click', 'a', function () {
        var data = table_resultado_reporte.row($(this).parents('tr')).data();
        var action = $(this).attr('rel');
        //clear_modal();
        table_index_row = data.table_index;
        data_table_temp = data;

        if (data.id_movie != null) {
            $.ajax({
                type: "post",
                data: {id_movie: data.id_movie, action: action, id_operator: null, id_order: null},
                url: "/manage_movie/",
                dataType: "json",
                success: function (data) {
                    if (data != null) {
                        if (action === 'edit') {
                            $('#title_movie_data').html("<i class='ion ion-edit' aria-hidden='true'></i> Edit");
                            enabled_form_movie();
                            $('#id_movie').val(data.id_movie);
                            $('#director_data').val(data.director);
                            $('#clasification').val(data.clasification);
                            $('#main_character').val(data.main_character);
                            $('#name_data').val(data.name);
                            $('#number_copies').val(data.number_copies);
                            $('#summary').val(data.summary);
                            $('#year').val(data.year);
                            $('#action').val('edit_movie');
                        }
                        if (action === 'detail') {
                            $('#title_movie_data').html("<i class='ion-ios-list-outline' aria-hidden='true'></i> Details");
                            disabled_form_movie();
                            $('#id_movie').val(data.id_movie);
                            $('#director_data').val(data.director);
                            $('#clasification').val(data.clasification);
                            $('#main_character').val(data.main_character);
                            $('#name_data').val(data.name);
                            $('#number_copies').val(data.number_copies);
                            $('#summary').val(data.summary);
                            $('#year').val(data.year);
                        }
                    }
                }
            });
        }
    });

    $('#save').click(function () {
        var validatorObj = $('#form-data-edit').data('bootstrapValidator');
        validatorObj.validate();
        var action = $('#action').val();
        if (validatorObj.isValid()) {
            $('#modal-data-movies').modal('hide')
            var str_serialize = $('#form-data-edit').serialize();
            $.ajax({
                type: "post",
                data: str_serialize,
                url: "/manage_movie/",
                dataType: "json",
                success: function (data) {
                    if (data.ok === true && action != 'new_movie') {

                        table_resultado_reporte
                            .cell(table_index_row, 0)
                            .data(data.name_data)
                            .draw();


                        table_resultado_reporte
                            .cell(table_index_row, 1)
                            .data(data.year)
                            .draw();

                        table_resultado_reporte
                            .cell(table_index_row, 2)
                            .data(data.summary)
                            .draw();

                        toast_saved_ok();

                    }
                    if (data.ok === true && action === 'new_movie') {
                        toast_saved_ok()
                    }
                    if (data.ok === false) {
                        toastr.error('Error saving data...')
                    }
                }
            });

            $('#form-data-edit').bootstrapValidator('resetForm', true);
        }
        return validatorObj.isValid();
    });

    $("#name").keypress(function (e) {
        if (e.which == 13) {
            cargar_datos_reporte();
        }
    });

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

        toastr.success('All data saved...')
    }

    $('#form-data-edit').bootstrapValidator({
        // To use feedback icons, ensure that you use Bootstrap v3.1.0 or later
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            name_data: {
                validators: {
                    notEmpty: {
                        message: 'Please write a name'
                    }
                }
            },
            clasification: {
                validators: {
                    notEmpty: {
                        message: 'Please write a clasification'
                    }
                }
            },
            main_character: {
                validators: {
                    notEmpty: {
                        message: 'Please write a main character'
                    }
                }
            },
            director_data: {
                validators: {
                    notEmpty: {
                        message: 'Please write a director'
                    }
                }
            },
            number_copies: {
                validators: {
                    notEmpty: {
                        message: 'Please write a number of copy'
                    }
                }
            },
            year: {
                validators: {
                    notEmpty: {
                        message: 'Please write a year'
                    },
                    integer: {
                        message: 'Please write an integer...'
                    }
                }
            },
            summary: {
                validators: {
                    notEmpty: {
                        message: 'Please write a summary'
                    }
                }
            }
        }
    })
})
;




