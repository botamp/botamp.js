# Botamp Javascript Library

Use this library on your website to identify your Botamp contacts.

## Steps

1. Include the script in your HTML file
```
<script src="botamp.js"></script>
```
2. Initialize the library
```
botamp.load(PUBLIC_API_KEY)
```
*Get your public API key on your settings page.*
3. Identify the contact
```
botamp.identify([id], attributes)
```
 * When `id` is not provided and no contact id was saved before in the localStorage, the contact is created and it's id is saved in the localStorage.
 * When `id` is not provided, and contact id saved in the localStorage, the corresponding contact is updated.
 * When id is provided, the corresponding contact is updated.
