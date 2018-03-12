from django.db import models


class Movies(models.Model):
    id_movie = models.AutoField(primary_key=True, unique=True, null=False)
    name = models.CharField(max_length=200, default='')
    clasification = models.IntegerField()
    summary = models.CharField(max_length=200, default='')
    main_character = models.IntegerField()
    director = models.IntegerField()
    number_copies = models.IntegerField()
    free = models.IntegerField()
    rented = models.IntegerField()
    year = models.IntegerField()

    class Meta:
        db_table = 'movies'
        managed = False
        verbose_name_plural = "Movies"


class MovieRentTemp(models.Model):
    id = models.AutoField(primary_key=True, unique=True, null=False)
    date_created = models.DateTimeField()

    class Meta:
        db_table = 'movie_rent_temp'
        managed = False
        verbose_name_plural = "Movie Rent Temp"


class OrderRent(models.Model):
    id = models.AutoField(primary_key=True, unique=True, null=False)
    name = models.CharField(max_length=1000)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    class Meta:
        db_table = 'order_rent'
        managed = False
        verbose_name_plural = "Order Rent"


class MovieRent(models.Model):
    id = models.AutoField(primary_key=True, unique=True, null=False)
    id_movie = models.IntegerField()
    id_order = models.IntegerField()

    class Meta:
        db_table = 'movie_rent'
        managed = False
        verbose_name_plural = "Movie Rent"


class MovieRentCartTemp(models.Model):
    id = models.AutoField(primary_key=True, unique=True, null=False)
    id_movie = models.IntegerField()
    id_movie_rent_temp = models.IntegerField()
    id_order = models.IntegerField()

    class Meta:
        db_table = 'movie_rent_cart_temp'
        managed = False
        verbose_name_plural = "Movie Rent Cart Temp"
