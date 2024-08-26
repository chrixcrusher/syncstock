from django import forms

class StockLevelsFilterForm(forms.Form):
    start_date = forms.DateField(required=True, widget=forms.TextInput(attrs={'type': 'date'}))
    end_date = forms.DateField(required=True, widget=forms.TextInput(attrs={'type': 'date'}))


