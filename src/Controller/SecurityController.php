<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Twig\Environment;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use App\Entity\User;
use Symfony\Component\HttpFoundation\Request;
use App\Form\RegistrationFormType;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class SecurityController extends AbstractController
{
  // -----------------------
  // FIRST LEVEL PAGES
  // -----------------------
  //  I had to split this controller in two because of two different forms on the same page.
  // ¤ First function is for the display. It is rendered by a template with both forms.
  // ¤ Second function is only processing. It registers the new user and redirects to the first
  // function


    /**
      * @Route("/login/{newuser?}", name="login")
      * @return Response
     */
    public function login_display($newuser, Request $request, AuthenticationUtils $authenticationUtils): Response
    {
      // redirect to worldscontroller if the user is already logged in
      if($this->container->get('security.authorization_checker')->isGranted('ROLE_USER')){
        return $this->redirectToRoute('worlds.index');
      }
      // else display two forms :
      // one for authentication (it lives inside the twig template with action => worldscontroller)
      $lastUsername = $authenticationUtils->getLastUsername();
      $error = $authenticationUtils->getLastAuthenticationError();
      //one for registering (it's created right here)
      $user = new User();
      $form = $this->createForm(RegistrationFormType::class, $user);
      $form->handleRequest($request);

      // now rendering
      return $this->render('security/login.html.twig', [
        'last_username' => $lastUsername,
        'error' => $error,
        'registrationForm' => $form->createView(),
        'anonymous' => true,
        'newuser' => $newuser,
      ]);
    }

    /**
      * @Route("/register", name="register")
      * @return Response
     */
    public function registering(Request $request, UserPasswordEncoderInterface $passwordEncoder, ValidatorInterface $validator): Response
    {
      // must rebuild the form only to pass it the request
      $user = new User();
      $form = $this->createForm(RegistrationFormType::class, $user);
      $form->handleRequest($request);

      // has someone just registered ?
      if ($form->isSubmitted() && $form->isValid()) {
        // encode the plain password
        $user->setPassword(
            $passwordEncoder->encodePassword(
                $user,
                $form->get('plainPassword')->getData()
            )
        );
        // set the default role as string, since JSON is not supported in SQL v5.6 database
        $user->setRoles('ROLE_USER');

        // saving new user
        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($user);
        $entityManager->flush();

        return $this->redirectToRoute('login', [
          'newuser' => $user->getUsername(),
        ]);
      }
      // in case this route is called but there is no request : redirect to the display function
      return $this->redirectToRoute('login');
    }
}

?>
