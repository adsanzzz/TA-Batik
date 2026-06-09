processed_img = preprocess_image(contents)

predictions = model.predict(processed_img)

predicted_class_idx = np.argmax(predictions[0])

confidence = float(predictions[0][predicted_class_idx])

predicted_class_name = CLASS_NAMES[predicted_class_idx]
