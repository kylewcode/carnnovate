import { Form } from 'react-router-dom';

export default function Create() {
    return (
        <Form method='post'>
            <label htmlFor="title">Title</label>
            <input type="text" name="title" id="title" />

            <label htmlFor="image">Upload image</label>
            <input type="file" name="image" id="image" />

            <label htmlFor="description">Description</label>
            <textarea name="description" id="description" cols="30" rows="10" defaultValue="Enter a description..."></textarea>

            <label htmlFor="ingredients">Ingredients</label>
            <textarea name="ingredients" id="ingredients" cols="30" rows="10" defaultValue="Enter ingredients with a new line for each ingredient."></textarea>

            <label htmlFor="instructions">Instructions</label>
            <textarea name="instructions" id="instructions" cols="30" rows="10" defaultValue="Enter instructions..."></textarea>

            <label htmlFor="time">Time (in minutes)</label>
            <input type="number" name="time" id="time" />

            <button type="submit">Submit</button>
        </Form>
    )
}