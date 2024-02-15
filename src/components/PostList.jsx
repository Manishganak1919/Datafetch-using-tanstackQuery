import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addPost, fetchPosts, fetchTags } from '../api/api';

const PostList = () => {
    const { isLoading, data: postData, error, isError } = useQuery({
        queryKey: ['posts', { page: 1 }],
        queryFn: fetchPosts
    });
    const { data: tagsData } = useQuery({
        queryKey: ["tags"],
        queryFn: fetchTags,
    });

    const [selectedTags, setSelectedTags] = useState([]);
    const queryClient = useQueryClient();

    const { mutate, isError: isPostError, error: postError, isPending, reset } = useMutation({
        mutationFn: addPost,
        onMutate: () => {
            return { id: 1 };
        },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries('posts');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const postTitle = formData.get("title");
        const tags = Array.from(formData.keys()).filter((key) => selectedTags.includes(key));

        if (!tags || !postTitle) {
            return;
        }

        mutate({ id: postData.length + 1, title: postTitle, tags });
        console.log(postTitle, tags);
        e.target.reset();
    };

    const handleTagChange = (e) => {
        const { checked, name } = e.target;
        if (checked) {
            setSelectedTags([...selectedTags, name]);
        } else {
            setSelectedTags(selectedTags.filter(tag => tag !== name));
        }
    };

    return (
        <div className='container'>
            <form onSubmit={handleSubmit}>
                <input
                    type='text'
                    placeholder='Enter your post'
                    className='postbox'
                    name='title'
                />
                <div className='tags'>
                    {tagsData && tagsData.map((tag) => (
                        <div key={tag}>
                            <input
                                name={tag}
                                id={tag}
                                type='checkbox'
                                onChange={handleTagChange}
                            />
                            <label htmlFor={tag}>{tag}</label>
                        </div>
                    ))}
                </div>
                <button type="submit">Post</button>
            </form>

            {(isLoading || isPending) && <p>Loading....</p>}
            {isError && <p>{error?.message}</p>}
            {isPostError && <p onClick={()=>reset()}>unable to post</p>}

            {postData && postData.map((ele) => (
                <div key={ele.id} className='post'>
                    <p>{ele.title}</p>
                    {ele.tags && ele.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default PostList;
