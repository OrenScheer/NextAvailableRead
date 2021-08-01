from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, SelectField, RadioField, IntegerField
from wtforms.validators import DataRequired, NumberRange

class BookQueryForm(FlaskForm):
    shelf = RadioField("Shelf", coerce=str, validators=[DataRequired()])
    number_of_books = IntegerField("Number of results", validators=[NumberRange(min=1, max=10, message="Number of books must be within 1 and 10."), DataRequired()])
    submit = SubmitField("Find my NextAvailableRead(s)")