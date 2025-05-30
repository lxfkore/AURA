import { FontAwesome } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import MenuBar from "../components/MenuBar";
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput } from "react-native";

const Community = ({ navigation }) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuButtonPosition, setMenuButtonPosition] = useState({ x: 0, y: 0 });
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [commentLiked, setCommentLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComments, setNewComments] = useState({}); // Track input per post
    const [newComment, setNewComment] = useState('');
    const [posts, setPosts] = useState([]);
    const [category, setCategory] = useState('blog'); // Add a state variable for category
    const route = useRoute();

    useEffect(() => {
        const postText = route.params?.postText;
        if (postText) {
            setPosts((prevPosts) => [
                ...prevPosts,
                { text: postText, likes: 0, comments: [] }, // Ensure comments is an array
            ]);
        }
    }, [route]);
    
    useEffect(() => {
        loadSavedPosts();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(`http://192.168.99.94:5000/api/posts?category=${category}`);
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data.map(post => ({ ...post, comments: post.comments || [] })));
                } else {
                    console.error('Error fetching posts:', response.statusText);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };
    
        fetchPosts();
    }, [category]); // Refetch when category changes
    
    useEffect(() => {
        const loadLikes = async () => {
            try {
                const likes = await AsyncStorage.getItem('likes');
                if (likes) {
                    setPosts((prevPosts) => {
                        const newPosts = [...prevPosts];
                        const likesData = JSON.parse(likes);
                        newPosts.forEach((post) => {
                            if (likesData[post.post_id]) {
                                post.likes = likesData[post.post_id];
                            }
                        });
                        return newPosts;
                    });
                }
            } catch (error) {
                console.error('Error loading likes:', error);
            }
        };
    
        loadLikes();
    }, []);

    useEffect(() => {
        const loadSavedPosts = async () => {
            try {
                const savedData = await AsyncStorage.getItem('savedPosts');
                if (savedData) {
                    const savedPosts = JSON.parse(savedData);
                    if (savedPosts.length > 0) {
                        setPosts((prevPosts) => {
                            return prevPosts.map((post) => ({
                                ...post,
                                saved: savedPosts.some((savedPost) => savedPost.post_id === post.post_id),
                            }));
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading saved posts:', error);
            }
        };
        loadSavedPosts();
    }, [posts]);

    const handleLike = async (postId) => {
        setPosts((prevPosts) => {
            const newPosts = prevPosts.map((post) =>
                post.post_id === postId ? { ...post, likes: (post.likes || 0) + 1 } : post
            );
            return newPosts;
        });
    
        try {
            const response = await fetch(`http://192.168.99.94:5000/api/posts/${postId}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
    
            if (!response.ok) {
                console.error("Failed to like post:", await response.text());
            }
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    const handleCommentLike = (postIndex, commentIndex) => {
        setPosts((prevPosts) => {
            const newPosts = [...prevPosts];
            const currentLikes = newPosts[postIndex].comments[commentIndex].likes || 0; // Ensure likes start at 0 if undefined
            newPosts[postIndex].comments[commentIndex] = { 
                ...newPosts[postIndex].comments[commentIndex], 
                likes: currentLikes + 1 
            };
            return newPosts;
        });
    };

 const handleComment = async (postId) => {
    const commentText = newComments[postId]?.trim();
    if (!commentText) return; // Prevent empty comments

    try {
        const response = await fetch("http://192.168.99.94:5000/api/comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comment_text: commentText, post_id: postId }),
        });

        if (response.ok) {
            const { comment_id } = await response.json();
            setPosts((prevPosts) => {
                const updatedPosts = [...prevPosts];
                const postIndex = updatedPosts.findIndex((post) => post.post_id === postId);
                if (postIndex !== -1) {
                    updatedPosts[postIndex] = {
                        ...updatedPosts[postIndex],
                        comments: [...(updatedPosts[postIndex].comments || []), { comment_id, text: commentText, likes: 0 }],
                    };
                }
                return updatedPosts;
            });
            setNewComments((prev) => ({ ...prev, [postId]: "" })); // Clear input
        } else {
            console.error("Failed to add comment:", await response.text());
        }
    } catch (error) {
        console.error("Error adding comment:", error);
    }
};

const handleSave = async (postId) => {
    setPosts((prevPosts) =>
        prevPosts.map((post) =>
            post.post_id === postId ? { ...post, saved: !post.saved } : post
        )
    );

    try {
        const savedPosts = posts.filter((post) => post.saved);
        await AsyncStorage.setItem('savedPosts', JSON.stringify(savedPosts.map(post => ({ post_id: post.post_id }))));
        console.log('Saved posts:', await AsyncStorage.getItem('savedPosts'));
    } catch (error) {
        console.error('Error saving post:', error);
    }
};

const loadSavedPosts = async () => {
    try {
        const savedData = await AsyncStorage.getItem('savedPosts');
        if (savedData) {
            const savedPosts = JSON.parse(savedData);
            setPosts((prevPosts) => {
                return prevPosts.map((post) => ({
                    ...post,
                    saved: savedPosts.some((savedPost) => savedPost.post_id === post.post_id),
                }));
            });
        }
    } catch (error) {
        console.error('Error loading saved posts:', error);
    }
};

    const handleInputChange = (postId, text) => {
        setNewComments((prev) => ({ ...prev, [postId]: text }));
    };
    
    const handleCategoryChange = (newCategory) => {
        setCategory(newCategory);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setMenuVisible(!menuVisible)}
                    onLayout={(event) => {
                        const { x, y } = event.nativeEvent.layout;
                        setMenuButtonPosition({ x: x - 250, y });
                    }}
                >
                    <FontAwesome name="bars" size={24} color="black" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.bellButton}>
                    <FontAwesome name="envelope" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* "Community" Label Below Menu Button */}
            <View style={styles.headerTitleContainer}>
                <Text style={styles.headerText}>Community</Text>
            </View>

            {/* Menu Dropdown */}
            {menuVisible && (
                <MenuBar
                    menuVisible={menuVisible}
                    setMenuVisible={setMenuVisible}
                    menuButtonPosition={{ left: 30, top: menuButtonPosition.y }}
                    navigation={navigation}
                    style={{ left: menuButtonPosition.left }}
                />
            )}

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity style={category === 'blog' ? styles.tabActive : styles.tabInactive} onPress={() => handleCategoryChange('blog')}>
                    <Text style={category === 'blog' ? styles.tabTextActive : styles.tabTextInactive}>blog</Text>
                </TouchableOpacity>
                <TouchableOpacity style={category === 'questionnaire' ? styles.tabActive : styles.tabInactive} onPress={() => handleCategoryChange('questionnaire')}>
                    <Text style={category === 'questionnaire' ? styles.tabTextActive : styles.tabTextInactive}>questionnaire</Text>
                </TouchableOpacity>
                <TouchableOpacity style={category === 'saved' ? styles.tabActive : styles.tabInactive} onPress={() => handleCategoryChange('saved')}>
                    <Text style={category === 'saved' ? styles.tabTextActive : styles.tabTextInactive}>saved</Text>
                </TouchableOpacity>
            </View>

            {/* Posts */}
            <ScrollView style={styles.posts}>
            {posts
        .filter((post) => category === "saved" ? post.saved : post.post_category === category)
        .map((post) => (
                    <View key={post.post_id} style={styles.post}>
                        <Text style={styles.postTitle}>{post.post_name}</Text>
                        <View style={styles.postStats}>
                            <View style={{ flexDirection: "row", flex: 1 }}>
                                <TouchableOpacity onPress={() => handleLike(post.post_id)}>
                                    <FontAwesome name="heart" size={16} color={post.likes > 0 ? "#db7a80" : "white"} />
                                </TouchableOpacity>
                                <Text style={styles.statsText}>{post.likes} likes</Text>
                                <View style={{ marginRight: 10 }}></View>
                                <TouchableOpacity onPress={() => console.log("Comment button pressed")}>
                                    <FontAwesome name="comment" size={16} color="white" />
                                </TouchableOpacity>
                                <Text style={styles.statsText}>
                                    {Array.isArray(post.comments) ? post.comments.length : 0} comments
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => handleSave(post.post_id)} style={{ position: "absolute", right: 0 }}>
                                <FontAwesome name="bookmark" size={16} color={post.saved ? "#db7a80" : "white"} />
                            </TouchableOpacity>
                        </View>

                        {/* Comments */}
                        <View style={styles.comments}>
                            {post.comments.map((comment, commentIndex) => (
                                <View key={commentIndex} style={styles.comment}>
                                    <Text style={styles.commentText}>{comment.text}</Text>
                                    <View style={styles.commentStats}>
                                        <TouchableOpacity onPress={() => console.log("Like button pressed")}>
                                            <FontAwesome name="heart" size={12} color={comment.likes > 0 ? "#db7a80" : "white"} />
                                        </TouchableOpacity>
                                        <Text style={styles.commentStatsText}>{comment.likes} likes</Text>
                                    </View>
                                </View>
                            ))}
                            <TextInput
                                    style={styles.newCommentInput}
                                    placeholder="Write a comment..."
                                    value={newComments[post.post_id] || ""}
                                    onChangeText={(text) => handleInputChange(post.post_id, text)}
                                />
                            <TouchableOpacity style={styles.postCommentButton} onPress={() => handleComment(post.post_id)}>
                                <Text style={styles.postCommentButtonText}>Post Comment</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Floating Button */}
            <TouchableOpacity 
                style={styles.floatingButton} 
                onPress={() => navigation.navigate('Post')}
            >
                <FontAwesome name="plus" size={24} color="white" />
            </TouchableOpacity>
                    </View>
        );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 60,
    },
    menuButton: {
        position: "absolute",
        left: 20,
    },
    bellButton: {
        position: "absolute",
        right: 20,
    },
    headerTitleContainer: {
        alignItems: "flex-start", // Align "Community" label to the left
        paddingHorizontal: 20,
        marginTop: 20,
    },
    headerText: {
        fontSize: 27,
        fontWeight: "600",
        textAlign: "left",
        marginTop: -60,
    },
    tabs: {
        flexDirection: "row",
        paddingHorizontal: 10,
        marginTop: -15,
    },
    tabActive: {
        backgroundColor: "#db7a80",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
    },
    tabInactive: {
        backgroundColor: "lightgray",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
    },
    tabTextActive: {
        color: "white",
        fontWeight: "bold",
    },
    tabTextInactive: {
        color: "black",
    },
    posts: {
        paddingHorizontal: 10,
        marginTop: 10,
    },
    post: {
        backgroundColor: "black",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    postTitle: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    postStats: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
        justifyContent: "space-between",
    },
    statsText: {
        color: "white",
        marginRight: 10,
    },
    comments: {
        marginTop: 10,
    },
    comment: {
        backgroundColor: "white",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    commentText: {
        color: "black",
        fontSize: 15,
    },
    commentStats: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 1,
        marginRight: 8,
    },
    commentStatsText: {
        color: "black",
        marginLeft: 6,
    },
    newCommentInput: {
        backgroundColor: "white",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        borderColor: "black",
        borderWidth: 1,
    },
    postCommentButton: {
        backgroundColor: "#db7a80",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    postCommentButtonText: {
        color: "white",
        fontSize: 15,
    },
    floatingButton: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "#db7a80",
        padding: 15,
        width: 55,
        height: 55,
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default Community;