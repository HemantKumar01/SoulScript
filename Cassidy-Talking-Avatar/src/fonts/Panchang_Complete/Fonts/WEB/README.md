# Installing Webfonts
Follow these simple Steps.

## 1.
Put `panchang/` Folder into a Folder called `fonts/`.

## 2.
Put `panchang.css` into your `css/` Folder.

## 3. (Optional)
You may adapt the `url('path')` in `panchang.css` depends on your Website Filesystem.

## 4.
Import `panchang.css` at the top of you main Stylesheet.

```
@import url('panchang.css');
```

## 5.
You are now ready to use the following Rules in your CSS to specify each Font Style:
```
font-family: Panchang-Extralight;
font-family: Panchang-Light;
font-family: Panchang-Regular;
font-family: Panchang-Medium;
font-family: Panchang-Semibold;
font-family: Panchang-Bold;
font-family: Panchang-Extrabold;
font-family: Panchang-Variable;

```
## 6. (Optional)
Use `font-variation-settings` rule to controll axes of variable fonts:
wght 800.0

Available axes:
'wght' (range from 200.0 to 800.0

