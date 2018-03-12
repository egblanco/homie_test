import uuid

from django.db import transaction, DatabaseError
from django.shortcuts import render, redirect

# Create your views here.
from django.views.generic import TemplateView, View
from chartjs.views.base import JSONResponseMixin
from manage_app.models import Movies, OrderRent, MovieRent, MovieRentCartTemp, MovieRentTemp
from django.db.models import Q, Count, Avg


def login_success(request):
    return redirect("/movies/")


class RentMovie(TemplateView):
    template_name = 'manage_app/rent_movie.html'

    def get_context_data(self, **kwargs):
        context = super(RentMovie, self).get_context_data(**kwargs)
        return context


class MovieManagementView(TemplateView):
    template_name = 'manage_app/movies.html'

    def get_context_data(self, **kwargs):
        context = super(MovieManagementView, self).get_context_data(**kwargs)
        return context


class QueryMovies(JSONResponseMixin, View):
    def post(self, request):
        name = request.POST['name'] if request.POST['name'] else None
        movies_all = Movies.objects.all()
        if name:
            name = name.strip()
            name_array = name.split(" ")
            for elem in name_array:
                movies_all = movies_all.filter(Q(name__icontains=elem))
        movies = []
        for elem in movies_all:
            movie = {}
            movie['id_movie'] = elem.id_movie
            movie['name'] = elem.name
            movie['director'] = elem.director
            movie['year'] = elem.year
            movie['main_character'] = elem.main_character
            movie['free'] = elem.free
            movie['summary'] = elem.summary
            movie['rented'] = elem.rented

            movies.append(movie)

        data = {'total_consulta': len(movies), 'data': movies}

        return self.render_to_response(data)


class RentMoviesFinal(JSONResponseMixin, View):
    def post(self, request):
        user_code = request.POST['user_code'] if request.POST['user_code'] else None
        data = {}
        if int(user_code) % 2 == 0:
            data['ok'] = True
        else:
            data['ok'] = False

        return self.render_to_response(data)


class MakeRent(JSONResponseMixin, View):
    def get_data_movie(self, array):
        array_movie = []
        for elem in array:
            movie = {}
            movie_data = Movies.objects.filter(id_movie=elem.id_movie).first()
            movie['name'] = movie_data.name
            movie['year'] = movie_data.year
            array_movie.append(movie)
        return array_movie

    def post(self, request):
        id_movie = request.POST['id_movie'] if request.POST['id_movie'] else None
        action = request.POST['action'] if request.POST['action'] else None
        id_operator = request.POST['id_operator'] if request.POST['id_operator'] else None
        id_order = request.POST['id_order'] if request.POST['id_order'] else None

        if action == 'add_rent':
            if id_order == 'empty':
                order_rent = OrderRent()
                order_rent.name = str(uuid.uuid4())
                try:
                    with transaction.atomic():
                        order_rent.save()
                        id_order = order_rent.id
                        movie_rent_cart_temp = MovieRentCartTemp()
                        movie_rent_cart_temp.id_order = order_rent.id
                        movie_rent_cart_temp.id_movie = id_movie
                        try:
                            with transaction.atomic():
                                movie_rent_cart_temp.save()
                                movie_rent_cart_temp_all_by_order = MovieRentCartTemp.objects.filter(
                                    id_order=order_rent.id).all()
                                data = {}
                                data['movie_rent_cart_temp_all_by_order'] = self.get_data_movie(
                                    movie_rent_cart_temp_all_by_order)
                                data_movie_last = Movies.objects.filter(id_movie=id_movie).first()
                                data['id_movie_last'] = id_movie
                                data['name_last'] = data_movie_last.name
                                data['year_last'] = data_movie_last.year
                                data['id_order'] = id_order
                                data['count_cart_film'] = len(data['movie_rent_cart_temp_all_by_order'])
                                data['exist'] = False
                                return self.render_to_response(data)
                        except DatabaseError:
                            response_error = {}
                            response_error['ok'] = False
                            return self.render_to_response(response_error)

                except DatabaseError:
                    response_error = {}
                    response_error['ok'] = False
                    return self.render_to_response(response_error)
            else:
                movie_in_cart = MovieRentCartTemp.objects.filter(id_movie=id_movie).filter(id_order=id_order).first()
                if not movie_in_cart:
                    movie_rent_cart_temp = MovieRentCartTemp()
                    movie_rent_cart_temp.id_order = id_order
                    movie_rent_cart_temp.id_movie = id_movie
                    try:
                        with transaction.atomic():
                            movie_rent_cart_temp.save()
                            movie_rent_cart_temp_all_by_order = MovieRentCartTemp.objects.filter(
                                id_order=id_order).all()
                            data = {}
                            data['movie_rent_cart_temp_all_by_order'] = self.get_data_movie(
                                movie_rent_cart_temp_all_by_order)
                            data_movie_last = Movies.objects.filter(id_movie=id_movie).first()
                            data['id_movie_last'] = id_movie
                            data['name_last'] = data_movie_last.name
                            data['year_last'] = data_movie_last.year
                            data['id_order'] = id_order
                            data['count_cart_film'] = len(data['movie_rent_cart_temp_all_by_order'])
                            data['exist'] = False
                            return self.render_to_response(data)
                    except DatabaseError:
                        response_error = {}
                        response_error['ok'] = False
                        return self.render_to_response(response_error)
                else:
                    data = {}
                    data['movie_rent_cart_temp_all_by_order'] = 0
                    data['id_movie_last'] = 0
                    data['id_order'] = 0
                    data['count_cart_film'] = 0
                    data['exist'] = True
                    return self.render_to_response(data)


class ManageMovies(JSONResponseMixin, View):
    def post(self, request):
        id_movie = request.POST['id_movie'] if request.POST['id_movie'] else None
        action = request.POST['action'] if request.POST['action'] else None
        id_operator = request.POST['id_operator'] if request.POST['id_operator'] else None
        id_order = request.POST['id_order'] if request.POST['id_order'] else None

        if action == 'edit':
            movie_by_id = Movies.objects.filter(id_movie=id_movie).first()
            movie_data = {}
            movie_data['id_movie'] = movie_by_id.id_movie
            movie_data['director'] = movie_by_id.director
            movie_data['clasification'] = movie_by_id.clasification
            movie_data['free'] = movie_by_id.free
            movie_data['main_character'] = movie_by_id.main_character
            movie_data['name'] = movie_by_id.name
            movie_data['number_copies'] = movie_by_id.number_copies
            movie_data['summary'] = movie_by_id.summary
            movie_data['year'] = movie_by_id.year
            return self.render_to_response(movie_data)

        if action == 'edit_movie':
            movie_data = Movies.objects.filter(id_movie=id_movie).first()
            movie_data.name = request.POST['name_data'] if request.POST['name_data'] else None
            movie_data.clasification = request.POST['clasification'] if request.POST['clasification'] else None
            movie_data.summary = request.POST['summary'] if request.POST['summary'] else None
            movie_data.main_character = request.POST['main_character'] if request.POST['main_character'] else None
            movie_data.director = request.POST['director_data'] if request.POST['director_data'] else None
            movie_data.number_copies = request.POST['number_copies'] if request.POST['number_copies'] else None
            movie_data.year = request.POST['year'] if request.POST['year'] else None

            try:
                with transaction.atomic():
                    movie_data.save()
                    data = {}
                    data['ok'] = True
                    data['name_data'] = movie_data.name
                    data['clasification'] = movie_data.clasification
                    data['summary'] = movie_data.summary
                    data['main_character'] = movie_data.main_character
                    data['director'] = movie_data.director
                    data['number_copies'] = movie_data.number_copies
                    data['free'] = movie_data.free
                    data['rented'] = movie_data.rented
                    data['year'] = movie_data.year
                    return self.render_to_response(data)
            except DatabaseError:
                response_error = {}
                response_error['ok'] = False
                return self.render_to_response(response_error)

        if action == 'detail':
            movie_by_id = Movies.objects.filter(id_movie=id_movie).first()
            movie_data = {}
            movie_data['id_movie'] = movie_by_id.id_movie
            movie_data['director'] = movie_by_id.director
            movie_data['clasification'] = movie_by_id.clasification
            movie_data['free'] = movie_by_id.free
            movie_data['main_character'] = movie_by_id.main_character
            movie_data['name'] = movie_by_id.name
            movie_data['number_copies'] = movie_by_id.number_copies
            movie_data['summary'] = movie_by_id.summary
            movie_data['year'] = movie_by_id.year
            return self.render_to_response(movie_data)

        if action == 'new_movie':

            movie_data = Movies()
            movie_data.name = request.POST['name_data'] if request.POST['name_data'] else None
            movie_data.clasification = request.POST['clasification'] if request.POST['clasification'] else None
            movie_data.summary = request.POST['summary'] if request.POST['summary'] else None
            movie_data.main_character = request.POST['main_character'] if request.POST['main_character'] else None
            movie_data.director = request.POST['director_data'] if request.POST['director_data'] else None
            movie_data.number_copies = request.POST['number_copies'] if request.POST['number_copies'] else None
            movie_data.year = request.POST['year'] if request.POST['year'] else None
            movie_data.free = request.POST['number_copies'] if request.POST['number_copies'] else None
            movie_data.rented = 0

            try:
                with transaction.atomic():
                    movie_data.save()

                    data = {}
                    data['ok'] = True
                    data['movie_data'] = movie_data
                    return self.render_to_response(data)
            except DatabaseError:
                response_error = {}
                response_error['ok'] = False
                return self.render_to_response(response_error)

        return self.render_to_response('')

    def get_data_movie(self, array):
        array_movie = []
        for elem in array:
            movie = {}
            movie_data = Movies.objects.filter(id_movie=elem.id_movie).first()
            movie['name'] = movie_data.name
            movie['year'] = movie_data.year
            array_movie.append(movie)
        return array_movie
